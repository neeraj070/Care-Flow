const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const seedAdmin = require("../utils/seedAdmin");

const JWT_SECRET = process.env.JWT_SECRET || "careflow-dev-secret-change-me";

const signToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const cleanUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const signup = async (req, res, next) => {
  try {
    const {
      username, email, password, role = "patient",
      age, gender, phone, address, bloodGroup,
      specialization, consultationFee, bio,
    } = req.body;

    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts are managed separately." });
    }
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email: normalizedEmail, password: passwordHash, role });

    if (role === "patient") {
      await Patient.create({
        userId: user._id,
        age: age || null,
        gender: gender || "",
        phone: phone || "",
        address: address || "",
        bloodGroup: bloodGroup || "",
      });
    }
    if (role === "doctor") {
      await Doctor.create({
        userId: user._id,
        specialization: specialization || "General",
        consultationFee: consultationFee != null ? Number(consultationFee) : 500,
        bio: bio || "",
        availability: [],
      });
    }

    const token = signToken(user._id);
    return res.status(201).json({ token, user: cleanUser(user) });
  } catch (error) {
    return next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    let adminUser = await User.findOne({ email: normalizedEmail, role: "admin" });

    // Self-heal: if no admin exists yet (first run / missing env), seed defaults.
    if (!adminUser) {
      try { await seedAdmin(); } catch (_) { /* ignore */ }
      adminUser = await User.findOne({ email: normalizedEmail, role: "admin" });
    }

    if (!adminUser) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const valid = await bcrypt.compare(password, adminUser.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = signToken(adminUser._id);
    return res.status(200).json({ token, user: cleanUser(adminUser) });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    return res.status(200).json({ token, user: cleanUser(user) });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { signup, login, adminLogin, me };
