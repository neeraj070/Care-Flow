const express = require("express");
const { getDashboard } = require("../controllers/adminController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.get("/dashboard", auth, roleGuard("admin"), getDashboard);

module.exports = router;
