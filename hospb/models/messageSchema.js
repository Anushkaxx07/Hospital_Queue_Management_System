import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: [true, "Message is required!"],
      minLength: [5, "Message must contain at least 5 characters!"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
