const express = require("express");
const {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.post("/", auth, roleGuard("patient"), createAppointment);
router.get("/", auth, listAppointments);
router.put("/:id/status", auth, roleGuard("doctor", "admin"), updateAppointmentStatus);

module.exports = router;
