const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
  service_name : {type : String, required : true},
  description : {type : String, required : true},
  price : {type : String, required : true},
  business_id: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required : true},
  subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  service_img : {type : String, required : true}
});

module.exports = mongoose.model("Services", servicesSchema);