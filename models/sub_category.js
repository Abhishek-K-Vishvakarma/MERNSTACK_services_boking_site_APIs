const mongoose = require('mongoose');

const sub_category_schema = new mongoose.Schema({
  subcategory_name : {type : String, required : true, unique : true},
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required : true},
  image_logo : {type : String, required : true}
}, {timestamps : true});

module.exports = mongoose.model("Subcategory", sub_category_schema);