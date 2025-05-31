const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure "uploads/" folder exists
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir);
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, "logo-" + Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage });

module.exports = upload;
