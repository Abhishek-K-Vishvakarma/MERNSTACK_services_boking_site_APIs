const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  appointment_date: { type: String, required: true },
  time_slot: { type: String, required: true },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Services", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending", "Booked", "Cancelled", "Scheduled"], default: "Pending"},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);