import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

const getTokenFromReq = (req, cookieName) => {
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = getTokenFromReq(req, "adminToken");
  if (!token) {
    return next(new ErrorHandler("Admin is not authenticated! Please login.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user || req.user.role !== "Admin") {
      return next(new ErrorHandler("Unauthorized: Admin access required!", 403));
    }
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired session token!", 401));
  }
});

export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = getTokenFromReq(req, "doctorToken") || getTokenFromReq(req, "adminToken");
  if (!token) {
    return next(new ErrorHandler("Doctor is not authenticated! Please login.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user || !["Doctor", "Admin"].includes(req.user.role)) {
      return next(new ErrorHandler("Unauthorized: Doctor access required!", 403));
    }
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired session token!", 401));
  }
});

export const isStaffAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token =
    getTokenFromReq(req, "adminToken") ||
    getTokenFromReq(req, "doctorToken");
  if (!token) {
    return next(new ErrorHandler("Staff session required! Please login.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user || !["Admin", "Doctor"].includes(req.user.role)) {
      return next(new ErrorHandler("Staff privileges required!", 403));
    }
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired session token!", 401));
  }
});

export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = getTokenFromReq(req, "patientToken");
  if (!token) {
    return next(new ErrorHandler("Patient is not authenticated! Please sign in.", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user || req.user.role !== "Patient") {
      return next(new ErrorHandler("Access restricted to Patient accounts!", 403));
    }
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired session token!", 401));
  }
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user?.role || "User"} is not authorized to access this resource!`,
          403
        )
      );
    }
    next();
  };
};