const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalBills,
      paidBills,
      pendingBills,
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Billing.countDocuments(),
      Billing.countDocuments({ paymentStatus: "paid" }),
      Billing.countDocuments({ paymentStatus: "pending" }),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalBills,
        paidBills,
        pendingBills,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboard,
};
