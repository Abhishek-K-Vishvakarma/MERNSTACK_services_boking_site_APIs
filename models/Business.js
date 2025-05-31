const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  business_name: { type: String, required: true, unique: true },
  address: { type: String },
  business_contact: { type: String, required: true },
  logo_url: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);