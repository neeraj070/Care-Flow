const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Billing = require("../models/Billing");

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// returns true if appointmentDateTime falls inside any availability slot
function isWithinAvailability(doctor, when) {
  if (!doctor?.availability?.length) return false;
  const dateStr = when.toISOString().slice(0, 10); // YYYY-MM-DD
  const weekday = WEEKDAYS[when.getDay()];
  const hh = String(when.getHours()).padStart(2, "0");
  const mm = String(when.getMinutes()).padStart(2, "0");
  const t = `${hh}:${mm}`;

  return doctor.availability.some((slot) => {
    const dayMatches =
      slot.day === dateStr ||
      String(slot.day || "").toLowerCase() === weekday;
    if (!dayMatches) return false;
    return slot.startTime <= t && t < slot.endTime;
  });
}

const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate } = req.body;
    if (!doctorId || !appointmentDate) {
      return res.status(400).json({ message: "doctorId and appointmentDate are required" });
    }
    const when = new Date(appointmentDate);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: "Invalid appointmentDate" });
    }
    if (when.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Appointment time must be in the future." });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (!isWithinAvailability(doctor, when)) {
      return res.status(400).json({
        message: "Selected time is outside the doctor's available slots.",
      });
    }

    // Auto-confirm and generate a pending bill at the doctor's consultation fee.
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: when,
      status: "confirmed",
    });

    const bill = await Billing.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentId: appointment._id,
      amount: Number(doctor.consultationFee || 500),
      paymentMethod: "unset",
      paymentStatus: "pending",
    });

    return res.status(201).json({ appointment, bill });
  } catch (error) {
    return next(error);
  }
};

const listAppointments = async (req, res, next) => {
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
    const appointments = await Appointment.find(query)
      .populate({ path: "patientId", populate: { path: "userId", select: "username email" } })
      .populate({ path: "doctorId", populate: { path: "userId", select: "username email" } })
      .sort({ appointmentDate: -1 });
    return res.status(200).json({ appointments });
  } catch (error) {
    return next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.status = status;
    await appointment.save();
    return res.status(200).json({ appointment });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createAppointment, listAppointments, updateAppointmentStatus };
