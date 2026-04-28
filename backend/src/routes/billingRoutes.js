const express = require("express");
const {
  createBill,
  listBills,
  chooseMethod,
  createRazorpayOrder,
  verifyRazorpayPayment,
  updatePaymentStatus,
} = require("../controllers/billingController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();

router.post("/", auth, roleGuard("admin"), createBill);
router.get("/", auth, listBills);
router.put("/:id/method", auth, roleGuard("patient"), chooseMethod);
router.post("/:id/razorpay-order", auth, roleGuard("patient"), createRazorpayOrder);
router.post("/:id/razorpay-verify", auth, roleGuard("patient"), verifyRazorpayPayment);
router.put("/:id/status", auth, roleGuard("admin", "doctor"), updatePaymentStatus);

module.exports = router;
