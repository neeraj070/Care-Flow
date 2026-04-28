const express = require("express");
const {
  getMyProfile,
  updateMedicalHistory,
  listPatients,
} = require("../controllers/patientController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.get("/me", auth, roleGuard("patient"), getMyProfile);
router.put("/me", auth, roleGuard("patient"), updateMedicalHistory);
router.get("/", auth, roleGuard("admin"), listPatients);

module.exports = router;
