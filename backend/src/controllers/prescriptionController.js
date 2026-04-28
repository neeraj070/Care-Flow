const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const createPrescription = async (req, res, next) => {
  try {
    const { patientId, medicines = [], notes = "" } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor._id,
      medicines,
      notes,
    });

    return res.status(201).json({ prescription });
  } catch (error) {
    return next(error);
  }
};

const listPrescriptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      query = { patientId: patient ? patient._id : null };
    }
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      query = { doctorId: doctor ? doctor._id : null };
    }

    const prescriptions = await Prescription.find(query)
      .populate({ path: "patientId", populate: { path: "userId", select: "username email" } })
      .populate({ path: "doctorId", populate: { path: "userId", select: "username email" } })
      .sort({ createdAt: -1 });

    return res.status(200).json({ prescriptions });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPrescription,
  listPrescriptions,
};
