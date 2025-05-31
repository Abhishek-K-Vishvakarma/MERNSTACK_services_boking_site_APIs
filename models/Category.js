const mongoose = require('mongoose');

const createCategory = new mongoose.Schema({
  category_name : {type : String, required : true, unique : true},
  logo_url: { type: String, required: true }
}, {timestamps : true});

module.exports = mongoose.model('Category', createCategory);