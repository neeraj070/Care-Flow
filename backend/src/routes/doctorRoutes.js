const express = require("express");
const {
  listDoctors,
  listSpecializations,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  updateAvailability,
  listDoctorPatients,
} = require("../controllers/doctorController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.get("/", auth, listDoctors);
router.get("/specializations", auth, listSpecializations);
router.get("/me", auth, roleGuard("doctor"), getMyDoctorProfile);
router.put("/me", auth, roleGuard("doctor"), updateMyDoctorProfile);
router.get("/patients", auth, roleGuard("doctor"), listDoctorPatients);
router.put("/availability", auth, roleGuard("doctor"), updateAvailability);

module.exports = router;
