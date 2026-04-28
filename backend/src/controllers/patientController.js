const Patient = require("../models/Patient");

const getMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id }).populate(
      "userId", "username email role"
    );
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    return res.status(200).json({ patient });
  } catch (error) {
    return next(error);
  }
};

const updateMedicalHistory = async (req, res, next) => {
  try {
    const { medicalHistory, age, gender, phone, address, bloodGroup } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    if (Array.isArray(medicalHistory)) patient.medicalHistory = medicalHistory;
    if (typeof age !== "undefined") patient.age = age;
    if (typeof gender !== "undefined") patient.gender = gender;
    if (typeof phone !== "undefined") patient.phone = phone;
    if (typeof address !== "undefined") patient.address = address;
    if (typeof bloodGroup !== "undefined") patient.bloodGroup = bloodGroup;
    await patient.save();
    return res.status(200).json({ patient });
  } catch (error) {
    return next(error);
  }
};

const listPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().populate("userId", "username email role");
    return res.status(200).json({ patients });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMyProfile, updateMedicalHistory, listPatients };
