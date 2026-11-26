import express from "express";
import {
  postAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentsByPatient,
  callNextPatient,
  getLiveQueue,
  getDashboardAnalytics,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isStaffAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isStaffAuthenticated, getAllAppointments);
router.get("/my", isPatientAuthenticated, getMyAppointments);
router.put("/update/:id", isStaffAuthenticated, updateAppointmentStatus);
router.post("/call-next", isStaffAuthenticated, callNextPatient);
router.get("/live-queue", getLiveQueue);
router.get("/analytics", isStaffAuthenticated, getDashboardAnalytics);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.get("/myappointments/:id", isPatientAuthenticated, getAppointmentsByPatient);

export default router;