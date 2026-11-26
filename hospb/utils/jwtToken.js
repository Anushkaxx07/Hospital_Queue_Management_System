export const generateToken = (user, message, statusCode, res) => {
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User is not defined",
    });
  }

  const token = user.generateJsonWebToken();
  const cookieName =
    user.role === "Admin"
      ? "adminToken"
      : user.role === "Doctor"
      ? "doctorToken"
      : "patientToken";

  const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        dob: user.dob,
        gender: user.gender,
        role: user.role,
        doctorDepartment: user.doctorDepartment,
        docAvatar: user.docAvatar,
        cabinNumber: user.cabinNumber,
        averageConsultationMinutes: user.averageConsultationMinutes,
        isAvailable: user.isAvailable,
      },
      token,
    });
};