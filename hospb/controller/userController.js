import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
  if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
    return next(new ErrorHandler("Please fill out all required fields!", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isRegistered = await User.findOne({ email: normalizedEmail });
  if (isRegistered) {
    return next(new ErrorHandler("An account with this email already exists!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Patient",
  });

  generateToken(user, "Patient registered successfully!", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role!", 400));
  }

  // If client passes confirmPassword, verify it matches; but don't strictly require it
  if (confirmPassword && password !== confirmPassword) {
    return next(new ErrorHandler("Password and confirm password do not match!", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password!", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password!", 401));
  }

  // Allow Admin to log into doctor view if desired, but check requested role match
  if (role !== user.role) {
    return next(new ErrorHandler(`No account registered with role "${role}" for this email!`, 403));
  }

  generateToken(user, `Welcome back, ${user.firstName}!`, 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
  if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
    return next(new ErrorHandler("Please provide all required admin details!", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isRegistered = await User.findOne({ email: normalizedEmail });
  if (isRegistered) {
    return next(new ErrorHandler("Admin with this email already exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Admin",
  });

  res.status(201).json({
    success: true,
    message: "New Administrator registered successfully!",
    admin,
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
    cabinNumber,
    averageConsultationMinutes,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please fill out all required doctor fields!", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isRegistered = await User.findOne({ email: normalizedEmail });
  if (isRegistered) {
    return next(new ErrorHandler("A doctor with this email is already registered!", 400));
  }

  let docAvatar = {
    public_id: "default_doc",
    url: "/docHolder.jpg",
  };

  // Process uploaded avatar if supplied
  if (req.files && req.files.docAvatar) {
    const avatarFile = req.files.docAvatar;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/avif"];
    if (!allowedFormats.includes(avatarFile.mimetype)) {
      return next(new ErrorHandler("Avatar file format not supported! (PNG, JPEG, WebP only)", 400));
    }

    try {
      if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const filePath = avatarFile.tempFilePath || avatarFile.path;
        if (filePath) {
          const cloudinaryResponse = await cloudinary.v2.uploader.upload(filePath, {
            folder: "curamed_doctors",
          });
          docAvatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        }
      }
    } catch (uploadError) {
      console.warn("Cloudinary upload failed, defaulting to placeholder avatar:", uploadError.message);
      docAvatar = {
        public_id: "default_fallback",
        url: "/docHolder.jpg",
      };
    }
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    password,
    gender,
    dob,
    nic,
    doctorDepartment,
    role: "Doctor",
    cabinNumber: cabinNumber || "Cabin 101",
    averageConsultationMinutes: Number(averageConsultationMinutes) || 15,
    docAvatar,
  });

  res.status(201).json({
    success: true,
    message: "New Doctor registered successfully!",
    doctor,
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const { department } = req.query;
  const filter = { role: "Doctor" };
  if (department) {
    filter.doctorDepartment = department;
  }

  const doctors = await User.find(filter).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    doctors,
    count: doctors.length,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Admin logged out successfully!",
    });
});

export const logoutDoctor = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("doctorToken", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Doctor logged out successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Patient logged out successfully!",
    });
});
