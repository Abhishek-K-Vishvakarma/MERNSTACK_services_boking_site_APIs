const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_id: { type: String, required: true, unique: true },
  appointment_id: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Refunded", "Failed"], default: "Pending" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);