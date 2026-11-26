import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required!"],
      minLength: [3, "First name must contain at least 3 characters!"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required!"],
      minLength: [2, "Last name must contain at least 2 characters!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      validate: [validator.isEmail, "Please provide a valid email!"],
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
      minLength: [5, "NIC must contain at least 5 characters!"],
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
    password: {
      type: String,
      minLength: [6, "Password must contain at least 6 characters!"],
      required: [true, "Password is required!"],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Patient", "Doctor"],
      default: "Patient",
    },
    doctorDepartment: {
      type: String,
      trim: true,
    },
    docAvatar: {
      public_id: String,
      url: String,
    },
    // Doctor OPD Queue metadata
    cabinNumber: {
      type: String,
      default: "Cabin 101",
    },
    averageConsultationMinutes: {
      type: Number,
      default: 15,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Backward compatibility getter/setter for typo `docAvator`
userSchema.virtual("docAvator").get(function () {
  return this.docAvatar;
}).set(function (val) {
  this.docAvatar = val;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

export const User = mongoose.model("User", userSchema);
