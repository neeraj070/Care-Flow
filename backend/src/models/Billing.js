const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["online", "offline", "unset"], default: "unset" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
