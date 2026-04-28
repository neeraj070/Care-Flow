const Doctor = require("../models/Doctor");
const User = require("../models/User");

const listDoctors = async (req, res, next) => {
  try {
    const { specialization } = req.query;
    const query = specialization ? { specialization } : {};
    const doctors = await Doctor.find(query).populate("userId", "username email role");
    return res.status(200).json({ doctors });
  } catch (error) {
    return next(error);
  }
};

const listSpecializations = async (req, res, next) => {
  try {
    const specs = await Doctor.distinct("specialization");
    return res.status(200).json({ specializations: specs.filter(Boolean).sort() });
  } catch (error) {
    return next(error);
  }
};

const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      "userId", "username email role"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    return res.status(200).json({ doctor });
  } catch (error) {
    return next(error);
  }
};

const updateMyDoctorProfile = async (req, res, next) => {
  try {
    const { specialization, consultationFee, bio, phone } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    if (specialization != null) doctor.specialization = specialization;
    if (consultationFee != null) doctor.consultationFee = Number(consultationFee);
    if (bio != null) doctor.bio = bio;
    if (phone != null) doctor.phone = phone;
    await doctor.save();
    return res.status(200).json({ doctor });
  } catch (error) {
    return next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { availability = [], consultationFee } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    doctor.availability = availability;
    if (consultationFee != null && !Number.isNaN(Number(consultationFee))) {
      doctor.consultationFee = Number(consultationFee);
    }
    await doctor.save();
    return res.status(200).json({ doctor });
  } catch (error) {
    return next(error);
  }
};

const listDoctorPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    const users = await User.find({ role: "patient" }).select("username email role");
    return res.status(200).json({ users, doctorId: doctor._id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listDoctors,
  listSpecializations,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  updateAvailability,
  listDoctorPatients,
};
