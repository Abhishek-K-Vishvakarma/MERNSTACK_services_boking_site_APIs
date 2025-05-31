const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true, unique : true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);


// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: { type: String, required: true }, // Keep this for user's phone
//   role: { type: String, required: true }, // Removed `unique: true`

//   // Business Fields
//   business_name: { type: String, required: true }, // Removed `unique: true`
//   address: { type: String },
//   business_contact: { type: String, required: true }, // Renamed for clarity
//   logo_url: { type: String, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);