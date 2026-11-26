import mongoose from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required!"],
      minLength: [2, "First Name must contain at least 2 characters!"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required!"],
      minLength: [2, "Last Name must contain at least 2 characters!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      validate: [validator.isEmail, "Provide a valid email!"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required!"],
      minLength: [10, "Phone number must contain at least 10 digits!"],
      maxLength: [15, "Phone number cannot exceed 15 digits!"],
    },
    nic: {
      type: String,
      required: [true, "NIC/ID is required!"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required!"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required!"],
      enum: ["Male", "Female", "Other"],
    },
    appointment_date: {
      type: String,
      required: [true, "Appointment Date is required!"],
    },
    department: {
      type: String,
      required: [true, "Department Name is required!"],
    },
    doctor: {
      firstName: {
        type: String,
        required: [true, "Doctor First Name is required!"],
      },
      lastName: {
        type: String,
        required: [true, "Doctor Last Name is required!"],
      },
    },
    hasVisited: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, "Address is required!"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor Id is required!"],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient Id is required!"],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Confirmed", "Waiting", "Serving", "Completed", "Cancelled", "No-Show"],
      default: "Accepted",
    },
    tokenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    tokenCode: {
      type: String,
      default: "OPD-101",
    },
    queuePosition: {
      type: Number,
      required: true,
      default: 1,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    consultationNotes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    calledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
