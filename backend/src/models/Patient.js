const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    medicalHistory: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
