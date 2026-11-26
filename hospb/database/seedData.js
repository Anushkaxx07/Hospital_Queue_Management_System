import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";

export const seedDatabase = async () => {
  try {
    const doctorCount = await User.countDocuments({ role: "Doctor" });
    let docMap = {};

    if (doctorCount === 0) {
      console.log("🌱 Seeding default medical staff & doctors...");

      const demoDoctors = [
        {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@curamed.com",
          phone: "9876543210",
          nic: "NIC100000001",
          dob: new Date("1985-04-12"),
          gender: "Female",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Pediatrics",
          cabinNumber: "Cabin 101 (OPD)",
          averageConsultationMinutes: 15,
          docAvatar: { public_id: "doc1", url: "/doc1.jpg" },
        },
        {
          firstName: "Michael",
          lastName: "Chang",
          email: "michael.chang@curamed.com",
          phone: "9876543211",
          nic: "NIC100000002",
          dob: new Date("1982-08-23"),
          gender: "Male",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Orthopedics",
          cabinNumber: "Cabin 102 (OPD)",
          averageConsultationMinutes: 20,
          docAvatar: { public_id: "doc2", url: "/doc2.jpg" },
        },
        {
          firstName: "Elena",
          lastName: "Rostova",
          email: "elena.rostova@curamed.com",
          phone: "9876543212",
          nic: "NIC100000003",
          dob: new Date("1980-02-15"),
          gender: "Female",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Cardiology",
          cabinNumber: "Cabin 201 (Cardio Wing)",
          averageConsultationMinutes: 20,
          docAvatar: { public_id: "doc3", url: "/doc3.jpg" },
        },
        {
          firstName: "David",
          lastName: "Chen",
          email: "david.chen@curamed.com",
          phone: "9876543213",
          nic: "NIC100000004",
          dob: new Date("1978-11-30"),
          gender: "Male",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Neurology",
          cabinNumber: "Cabin 202 (Neuro Wing)",
          averageConsultationMinutes: 25,
          docAvatar: { public_id: "doc4", url: "/doc4.jpg" },
        },
        {
          firstName: "Maya",
          lastName: "Patel",
          email: "maya.patel@curamed.com",
          phone: "9876543214",
          nic: "NIC100000005",
          dob: new Date("1986-07-09"),
          gender: "Female",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Oncology",
          cabinNumber: "Cabin 301 (Cancer Care)",
          averageConsultationMinutes: 30,
          docAvatar: { public_id: "doc5", url: "/doc5.jpg" },
        },
        {
          firstName: "Alexander",
          lastName: "Wright",
          email: "alexander.wright@curamed.com",
          phone: "9876543215",
          nic: "NIC100000006",
          dob: new Date("1984-09-17"),
          gender: "Male",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Radiology",
          cabinNumber: "Cabin 302 (Imaging Wing)",
          averageConsultationMinutes: 15,
          docAvatar: { public_id: "doc6", url: "/doc6.jpg" },
        },
        {
          firstName: "Chloe",
          lastName: "Bennett",
          email: "chloe.bennett@curamed.com",
          phone: "9876543216",
          nic: "NIC100000007",
          dob: new Date("1989-05-18"),
          gender: "Female",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Dermatology",
          cabinNumber: "Cabin 104 (Skin Care)",
          averageConsultationMinutes: 15,
          docAvatar: { public_id: "doc7", url: "/doc7.jpg" },
        },
        {
          firstName: "James",
          lastName: "Wilson",
          email: "james.wilson@curamed.com",
          phone: "9876543217",
          nic: "NIC100000008",
          dob: new Date("1981-01-25"),
          gender: "Male",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "ENT",
          cabinNumber: "Cabin 105 (ENT Wing)",
          averageConsultationMinutes: 15,
          docAvatar: { public_id: "doc8", url: "/doc8.jpg" },
        },
        {
          firstName: "Liam",
          lastName: "Foster",
          email: "liam.foster@curamed.com",
          phone: "9876543218",
          nic: "NIC100000009",
          dob: new Date("1990-10-04"),
          gender: "Male",
          password: "Password123!",
          role: "Doctor",
          doctorDepartment: "Physical Therapy",
          cabinNumber: "Cabin 106 (Rehab Wing)",
          averageConsultationMinutes: 25,
          docAvatar: { public_id: "doc10", url: "/doc10.jpg" },
        },
      ];

      for (const doc of demoDoctors) {
        const created = await User.create(doc);
        docMap[created.doctorDepartment] = created;
      }
      console.log("✅ 9 specialist doctors created.");
    }

    // Seed Admin
    const adminExists = await User.findOne({ email: "admin@curamed.com" });
    if (!adminExists) {
      await User.create({
        firstName: "System",
        lastName: "Admin",
        email: "admin@curamed.com",
        phone: "9876543299",
        nic: "NICADMIN00001",
        dob: new Date("1990-01-01"),
        gender: "Other",
        password: "Password123!",
        role: "Admin",
      });
      console.log("✅ Default Admin created: admin@curamed.com / Password123!");
    }

    // Seed Demo Patient
    let demoPatient = await User.findOne({ email: "patient@curamed.com" });
    if (!demoPatient) {
      demoPatient = await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "patient@curamed.com",
        phone: "9876543222",
        nic: "NICPATIENT001",
        dob: new Date("1995-06-15"),
        gender: "Male",
        password: "Password123!",
        role: "Patient",
      });
      console.log("✅ Default Patient created: patient@curamed.com / Password123!");
    }

    // Seed sample appointments for today if none exist
    const today = new Date().toISOString().split("T")[0];
    const appointmentCount = await Appointment.countDocuments({ appointment_date: today });
    if (appointmentCount === 0 && demoPatient) {
      const pediaDoctor = await User.findOne({ role: "Doctor", doctorDepartment: "Pediatrics" });
      const cardioDoctor = await User.findOne({ role: "Doctor", doctorDepartment: "Cardiology" });

      if (pediaDoctor) {
        await Appointment.create({
          firstName: "Emily",
          lastName: "Doe",
          email: "emily@example.com",
          phone: "9876543223",
          nic: "NICPATIENT002",
          dob: new Date("2018-05-12"),
          gender: "Female",
          appointment_date: today,
          department: "Pediatrics",
          doctor: { firstName: pediaDoctor.firstName, lastName: pediaDoctor.lastName },
          doctorId: pediaDoctor._id,
          patientId: demoPatient._id,
          address: "124 MedCity Ave, Floor 2",
          status: "Serving",
          tokenNumber: 1,
          tokenCode: "OPD-PED-01",
          queuePosition: 1,
          calledAt: new Date(),
        });

        await Appointment.create({
          firstName: "John",
          lastName: "Doe",
          email: "patient@curamed.com",
          phone: "9876543222",
          nic: "NICPATIENT001",
          dob: new Date("1995-06-15"),
          gender: "Male",
          appointment_date: today,
          department: "Pediatrics",
          doctor: { firstName: pediaDoctor.firstName, lastName: pediaDoctor.lastName },
          doctorId: pediaDoctor._id,
          patientId: demoPatient._id,
          address: "124 MedCity Ave, Floor 2",
          status: "Waiting",
          tokenNumber: 2,
          tokenCode: "OPD-PED-02",
          queuePosition: 2,
          estimatedWaitMinutes: 15,
        });
      }

      if (cardioDoctor) {
        await Appointment.create({
          firstName: "Robert",
          lastName: "Smith",
          email: "robert@example.com",
          phone: "9876543224",
          nic: "NICPATIENT003",
          dob: new Date("1975-03-21"),
          gender: "Male",
          appointment_date: today,
          department: "Cardiology",
          doctor: { firstName: cardioDoctor.firstName, lastName: cardioDoctor.lastName },
          doctorId: cardioDoctor._id,
          patientId: demoPatient._id,
          address: "740 HeartCare Blvd",
          status: "Waiting",
          tokenNumber: 1,
          tokenCode: "OPD-CAR-01",
          queuePosition: 1,
          estimatedWaitMinutes: 0,
        });
      }
      console.log("✅ Seeded sample live queue appointments for today.");
    }
  } catch (err) {
    console.error("Seed database error:", err.message);
  }
};
