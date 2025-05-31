const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  comment : {type : String, required : true},
  rating : {type : Number, required : true},
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Services", required : true},
  user_id : {type : mongoose.Schema.Types.ObjectId, ref: "User", required : true}
});

module.exports = mongoose.model("Review", reviewSchema);