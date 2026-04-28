const crypto = require("crypto");
const Billing = require("../models/Billing");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Use real keys from .env — set these in your .env file:
// RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
// RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "thisisadummyrazorpaysecret";

// Try to load real Razorpay SDK — falls back to mock if not installed
let Razorpay = null;
try {
  Razorpay = require("razorpay");
} catch (_) {
  // razorpay npm package not installed — will use mock order generation
}

const createBill = async (req, res, next) => {
  try {
    const { appointmentId, amount, paymentStatus = "pending" } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const existing = await Billing.findOne({ appointmentId });
    if (existing) return res.status(409).json({ message: "A bill already exists for this appointment" });

    const bill = await Billing.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      amount,
      paymentStatus,
      paidAt: paymentStatus === "paid" ? new Date() : null,
    });
    return res.status(201).json({ bill });
  } catch (error) {
    return next(error);
  }
};

const listBills = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      query = { patientId: patient ? patient._id : null };
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      query = { doctorId: doctor ? doctor._id : null };
    }

    const bills = await Billing.find(query)
      .populate({ path: "patientId", populate: { path: "userId", select: "username email" } })
      .populate({ path: "doctorId", populate: { path: "userId", select: "username email" } })
      .populate("appointmentId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ bills });
  } catch (error) {
    return next(error);
  }
};

const chooseMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    if (!["online", "offline"].includes(paymentMethod)) {
      return res.status(400).json({ message: "paymentMethod must be online or offline" });
    }
    const bill = await Billing.findById(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || String(patient._id) !== String(bill.patientId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    bill.paymentMethod = paymentMethod;
    await bill.save();
    return res.status(200).json({ bill });
  } catch (error) {
    return next(error);
  }
};

// Creates a real Razorpay order if SDK is installed + real keys are set,
// otherwise falls back to a mock order for local development.
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.paymentStatus === "paid") {
      return res.status(409).json({ message: "Bill is already paid" });
    }

    const amountInPaise = Math.round(bill.amount * 100);
    let orderId;

    // ── REAL RAZORPAY PATH ──────────────────────────────────────────────────
    const usingRealKeys =
      RAZORPAY_KEY_ID.startsWith("rzp_") &&
      RAZORPAY_KEY_SECRET !== "thisisadummyrazorpaysecret" &&
      Razorpay !== null;

    if (usingRealKeys) {
      const rzpInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      const order = await rzpInstance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `bill_${bill._id}`,
        notes: { billId: String(bill._id) },
      });
      orderId = order.id; // e.g. "order_XXXXXXXXXXXXXX"
    } else {
      // ── MOCK / TEST PATH ─────────────────────────────────────────────────
      orderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    }

    bill.razorpayOrderId = orderId;
    bill.paymentMethod = "online";
    await bill.save();

    // IMPORTANT: return `orderId` (not `order_id`) — must match frontend
    return res.status(200).json({
      orderId,                  // ← frontend reads order.orderId
      keyId: RAZORPAY_KEY_ID,   // ← frontend reads order.keyId
      amount: amountInPaise,    // paise
      currency: "INR",
      billId: bill._id,
    });
  } catch (error) {
    return next(error);
  }
};

// Verifies the Razorpay HMAC signature.
// For real keys: strict HMAC check.
// For dummy/test keys: also accepts "simulated_ok" so devs can test without real Razorpay.
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const bill = await Billing.findById(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    if (bill.paymentStatus === "paid") {
      return res.status(409).json({ message: "Bill is already paid" });
    }

    const usingRealKeys = RAZORPAY_KEY_SECRET !== "thisisadummyrazorpaysecret";

    if (usingRealKeys) {
      // Strict HMAC — no simulation allowed with real keys
      const expected = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature — payment not verified" });
      }
    } else {
      // Test/mock mode: accept HMAC match OR the simulation flag
      const expected = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isSimulated = razorpay_signature === "simulated_ok";
      if (!isSimulated && expected !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    bill.razorpayPaymentId = razorpay_payment_id || `pay_${crypto.randomBytes(8).toString("hex")}`;
    bill.paymentMethod = "online";
    bill.paymentStatus = "paid";
    bill.paidAt = new Date();
    await bill.save();
    return res.status(200).json({ bill });
  } catch (error) {
    return next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const bill = await Billing.findById(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || String(doctor._id) !== String(bill.doctorId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    bill.paymentStatus = paymentStatus;
    bill.paidAt = paymentStatus === "paid" ? new Date() : null;
    await bill.save();
    return res.status(200).json({ bill });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBill,
  listBills,
  chooseMethod,
  createRazorpayOrder,
  verifyRazorpayPayment,
  updatePaymentStatus,
};