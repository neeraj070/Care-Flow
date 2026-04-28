const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },        // ISO date YYYY-MM-DD or weekday
    startTime: { type: String, required: true },  // "HH:mm"
    endTime: { type: String, required: true },    // "HH:mm"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true },
    consultationFee: { type: Number, default: 500, min: 0 },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    availability: { type: [availabilitySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
