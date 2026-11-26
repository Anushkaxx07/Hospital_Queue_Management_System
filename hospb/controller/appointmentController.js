import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

// Helper to broadcast socket queue update if io is attached to app
const notifyQueueUpdate = (req, payload = {}) => {
  try {
    const io = req.app.get("io");
    if (io) {
      io.emit("queue:updated", payload);
    }
  } catch (err) {
    console.warn("Socket broadcast failed:", err.message);
  }
};

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id;

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctorId: incomingDoctorId,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !address
  ) {
    return next(new ErrorHandler("Please fill out all required appointment fields!", 400));
  }

  // Find target doctor either via direct doctorId or by name & department
  let doctor = null;
  if (incomingDoctorId) {
    doctor = await User.findById(incomingDoctorId);
  } else if (doctor_firstName && doctor_lastName) {
    doctor = await User.findOne({
      firstName: doctor_firstName,
      lastName: doctor_lastName,
      role: "Doctor",
      doctorDepartment: department,
    });
  }

  if (!doctor) {
    // If not found by specific name, pick the first available doctor in this department
    doctor = await User.findOne({
      role: "Doctor",
      doctorDepartment: department,
    });
  }

  if (!doctor) {
    return next(
      new ErrorHandler(`No doctor currently registered for department: ${department}`, 404)
    );
  }

  const doctorId = doctor._id;

  // Count existing appointments for this doctor on the requested date to allocate token
  const existingSameDay = await Appointment.find({
    doctorId,
    appointment_date,
    status: { $ne: "Cancelled" },
  }).sort({ tokenNumber: 1 });

  const tokenNumber = existingSameDay.length + 1;
  const deptPrefix = department.substring(0, 3).toUpperCase();
  const tokenCode = `OPD-${deptPrefix}-${String(tokenNumber).padStart(2, "0")}`;

  const avgConsultMins = doctor.averageConsultationMinutes || 15;
  const estimatedWaitMinutes = (tokenNumber - 1) * avgConsultMins;

  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
    },
    hasVisited: Boolean(hasVisited),
    address,
    doctorId,
    patientId,
    tokenNumber,
    tokenCode,
    queuePosition: tokenNumber,
    estimatedWaitMinutes,
    status: "Waiting",
  });

  notifyQueueUpdate(req, {
    action: "new_appointment",
    doctorId,
    department,
    date: appointment_date,
    tokenCode,
  });

  res.status(201).json({
    success: true,
    message: `Appointment booked! Your OPD Token is ${tokenCode}`,
    appointment,
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const { date, department, doctorId, status } = req.query;
  const filter = {};

  if (date) filter.appointment_date = date;
  if (department) filter.department = department;
  if (doctorId) filter.doctorId = doctorId;
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("doctorId", "firstName lastName doctorDepartment cabinNumber averageConsultationMinutes docAvatar")
    .populate("patientId", "firstName lastName email phone")
    .sort({ appointment_date: -1, tokenNumber: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointment: appointments, // keeping legacy 'appointment' key for dashboard backwards compat
    appointments,
  });
});

export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
  const myAppointments = await Appointment.find({ patientId: req.user._id })
    .populate("doctorId", "firstName lastName doctorDepartment cabinNumber averageConsultationMinutes docAvatar")
    .sort({ createdAt: -1 });

  // For each appointment, calculate live queue metrics
  const appointmentsWithQueue = await Promise.all(
    myAppointments.map(async (app) => {
      const appObj = app.toObject();

      // Find current serving patient for this doctor & date
      const servingApp = await Appointment.findOne({
        doctorId: app.doctorId?._id || app.doctorId,
        appointment_date: app.appointment_date,
        status: "Serving",
      });

      // Count patients waiting ahead of this appointment
      const aheadCount = await Appointment.countDocuments({
        doctorId: app.doctorId?._id || app.doctorId,
        appointment_date: app.appointment_date,
        status: { $in: ["Waiting", "Accepted", "Pending"] },
        tokenNumber: { $lt: app.tokenNumber },
      });

      // Total queue length for this doctor & date
      const totalInQueue = await Appointment.countDocuments({
        doctorId: app.doctorId?._id || app.doctorId,
        appointment_date: app.appointment_date,
        status: { $ne: "Cancelled" },
      });

      const avgMinutes = app.doctorId?.averageConsultationMinutes || 15;
      const liveEstimatedWaitMinutes = aheadCount * avgMinutes;

      return {
        ...appObj,
        currentlyServingToken: servingApp ? servingApp.tokenCode : "Not Started",
        currentlyServingNumber: servingApp ? servingApp.tokenNumber : null,
        patientsAhead: aheadCount,
        totalInQueue,
        liveEstimatedWaitMinutes,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: appointmentsWithQueue.length,
    appointments: appointmentsWithQueue,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, consultationNotes, prescription } = req.body;

  let appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  const updates = {};
  if (status) updates.status = status;
  if (consultationNotes !== undefined) updates.consultationNotes = consultationNotes;
  if (prescription !== undefined) updates.prescription = prescription;

  if (status === "Serving") {
    updates.calledAt = new Date();
    // Complete any other appointment currently serving for this doctor
    await Appointment.updateMany(
      {
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        appointment_date: appointment.appointment_date,
        status: "Serving",
      },
      {
        status: "Completed",
        completedAt: new Date(),
      }
    );
  } else if (status === "Completed") {
    updates.completedAt = new Date();
    updates.hasVisited = true;
  }

  appointment = await Appointment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  notifyQueueUpdate(req, {
    action: "status_changed",
    appointmentId: id,
    status: appointment.status,
    doctorId: appointment.doctorId,
    date: appointment.appointment_date,
  });

  res.status(200).json({
    success: true,
    message: `Appointment marked as ${appointment.status}!`,
    appointment,
  });
});

export const callNextPatient = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.body;
  const todayDate = date || new Date().toISOString().split("T")[0];

  const targetDoctorId = doctorId || (req.user?.role === "Doctor" ? req.user._id : null);
  if (!targetDoctorId) {
    return next(new ErrorHandler("Doctor ID is required to call next patient!", 400));
  }

  // Complete any currently serving patient
  await Appointment.updateMany(
    {
      doctorId: targetDoctorId,
      appointment_date: todayDate,
      status: "Serving",
    },
    {
      status: "Completed",
      completedAt: new Date(),
      hasVisited: true,
    }
  );

  // Find next waiting patient in line
  const nextPatient = await Appointment.findOne({
    doctorId: targetDoctorId,
    appointment_date: todayDate,
    status: { $in: ["Waiting", "Accepted", "Pending"] },
  }).sort({ tokenNumber: 1 });

  if (!nextPatient) {
    return res.status(200).json({
      success: true,
      message: "All patients for today have been attended to!",
      appointment: null,
    });
  }

  nextPatient.status = "Serving";
  nextPatient.calledAt = new Date();
  await nextPatient.save();

  notifyQueueUpdate(req, {
    action: "patient_called",
    doctorId: targetDoctorId,
    date: todayDate,
    tokenCode: nextPatient.tokenCode,
    tokenNumber: nextPatient.tokenNumber,
  });

  res.status(200).json({
    success: true,
    message: `Now calling Token ${nextPatient.tokenCode}: ${nextPatient.firstName} ${nextPatient.lastName}`,
    appointment: nextPatient,
  });
});

export const getLiveQueue = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, department, date } = req.query;
  const today = date || new Date().toISOString().split("T")[0];

  const filter = { appointment_date: today, status: { $ne: "Cancelled" } };
  if (doctorId) filter.doctorId = doctorId;
  if (department) filter.department = department;

  const allTodayAppointments = await Appointment.find(filter)
    .populate("doctorId", "firstName lastName doctorDepartment cabinNumber")
    .sort({ tokenNumber: 1 });

  const currentlyServing = allTodayAppointments.find((a) => a.status === "Serving") || null;
  const waitingList = allTodayAppointments.filter((a) =>
    ["Waiting", "Accepted", "Pending"].includes(a.status)
  );
  const completedList = allTodayAppointments.filter((a) => a.status === "Completed");

  res.status(200).json({
    success: true,
    date: today,
    currentlyServing,
    nextInLine: waitingList.slice(0, 5),
    waitingCount: waitingList.length,
    completedCount: completedList.length,
    totalToday: allTodayAppointments.length,
  });
});

export const getDashboardAnalytics = catchAsyncErrors(async (req, res, next) => {
  const today = new Date().toISOString().split("T")[0];

  const [
    totalAppointments,
    todayAppointments,
    completedAppointments,
    waitingAppointments,
    totalDoctors,
    totalPatients,
    departmentStats,
    recentAppointments,
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointment_date: today }),
    Appointment.countDocuments({ status: "Completed" }),
    Appointment.countDocuments({ status: { $in: ["Waiting", "Accepted", "Serving"] } }),
    User.countDocuments({ role: "Doctor" }),
    User.countDocuments({ role: "Patient" }),
    Appointment.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Appointment.find()
      .populate("doctorId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalAppointments,
      todayAppointments,
      completedAppointments,
      waitingAppointments,
      totalDoctors,
      totalPatients,
      departmentStats,
      recentAppointments,
    },
  });
});

export const getAppointmentsByPatient = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointments = await Appointment.find({ patientId: id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  await appointment.deleteOne();

  notifyQueueUpdate(req, {
    action: "appointment_deleted",
    appointmentId: id,
  });

  res.status(200).json({
    success: true,
    message: "Appointment deleted successfully!",
  });
});
