const express = require("express");
const {
  createPrescription,
  listPrescriptions,
} = require("../controllers/prescriptionController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.post("/", auth, roleGuard("doctor"), createPrescription);
router.get("/", auth, listPrescriptions);

module.exports = router;
