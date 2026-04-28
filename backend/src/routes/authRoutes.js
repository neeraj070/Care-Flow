const express = require("express");
const { signup, login, adminLogin, me } = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.get("/me", auth, me);

module.exports = router;
