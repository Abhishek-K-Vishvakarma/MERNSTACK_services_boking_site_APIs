const User = require('../models/User');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const Category = require('../models/Category');
const Subcategory = require('../models/sub_category');
const Services = require('../models/services');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Appointment = require('../models/appointments');
const Payment = require('../models/payment');
const Review = require('../models/Reviews');
const Notificaton = require('../models/Notification');
const { v4: uuidv4 } = require("uuid");
const gereratedOtp = () => Math.floor(100000 + Math.random() * 900000);
const users = {};

const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vishabhishek019@gmail.com",
    // pass: "iccv rajb flod paei"
    pass : "chnx qxiw tumc mrxd",
  }
});

const register = async(req, res)=>{
  try {
    const { name, email, password, phone, role } = req.body;
    if(!email) return res.status(400).json({message : "Email must be required"});
    const otp = gereratedOtp();
    const otpexpired = Date.now() + 5 * 60 * 1000;
    users[email] = { otp, otpexpired };
    console.log(`This ${ email } OTP : ${ otp }`);
    const mailOptions = {
      from: "vishabhishek019@gmail.com",
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is: ${ otp }. It will expire in 5 minutes.`
    }
    await transpoter.sendMail(mailOptions);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashPassword, phone, role });       
    const userdata = await newUser.save();
    res.status(201).json({ message: "User Registration successfully!", data: userdata });
  } catch (err) {
    console.log("❌ Something went wrong:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


const verifyEmail = (req, res) => {
  const { email, otp } = req.body;
  if (!users[email]) return res.status(400).json({ message: "No OTP for this Email!" });
  const { otp: storeOtp, otpexpired } = users[email];
  if (Date.now() > otpexpired) {
    delete users[email];
    return res.status(400).json({ message: "OTP has expired!" })
  }
  if (storeOtp == otp) {
    delete users[email];
    return res.status(200).json({ message: "Email Verify Successfully!" });
  }
  res.status(400).json({ message: "Invalid OTP!" });
}


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: '❌Invalid Credintail!' });
    };
    const hashPasswords = await bcrypt.compare(password, user.password);
    if (!hashPasswords) {
      return res.status(400).json({ message: 'Invalid Credintail!' });
    }
    let SECRET_KEY = 'userloginhardsecretcode';
    const jwttoken = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    const data = {
      email: user.email,
      password: user.password,
      token: jwttoken
    }
    res.status(200).json({ message: '✅ Login Successfully!', data });
  } catch (err) {
    res.status(500).json({ message: '❌ Something wentWrong!' });
  }
}


const userCount = async (req, res) => {
  try {
    const count = await User.countDocuments({});
    res.json({ message: "Total Registarion user is :", totalUsers: count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user :", err });
  }
}

const usersListings = async (req, res) => {
  try {
    const datafind = await User.find({});
    res.json(datafind)
  } catch (err) {
    res.status(500).json({ message: "Server error"});
  }
}

const retrieve = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User retrieved", data: user });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateuser = async (req, res) => {
  try {
    const upuser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).select('-password');
    if (!upuser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully", data: upuser });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong!", error: err.message });
  }
};



const deleteuser = async (req, res) => {
  try {
    const deluser = await User.findByIdAndDelete(req.params.id);
    if (!deluser) return res.status(400).json({ message: "User not found!" });
    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", err })
  }
};

const forgotpass = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "❌Invalid User data", status: false });
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All field must be required!" });
    }
    const compareoldpass = await bcrypt.compare(oldPassword, user.password);
    if (!compareoldpass) return res.status(400).json({ message: "❌Invalid Old Password!", status : 400});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(201).json({
      message: '✅User password changed!', passdata: {
        status: true,
        email: user.email,
        old_Password: "********",
        new_Password: "********"
      }
    });
  } catch (err) {
    res.status(500).json({ message: "❌Something went wrong!" });
  }
};


const newandconfirm = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "❌Invalid User data!" });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "❌user password not matched!" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(201).json({
      message: "User New and Confirm password changed!", status: true, alldata: {
        email: user.email,
        new_password: "*********",
        confirm_password: "*********"
      }
    })
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
}


// Business Category Api Creation...
// Business " POST " Method...

const businessCategoryApi = async (req, res) => {
  try {
    const { business_name, address, business_contact, logo_url, user_id } = req.body;
    const businessExists = await Business.findOne({ business_name });
    if (businessExists) {
      return res.status(400).json({ message: "Business Name already exists! Please use a unique name." });
    }
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(404).json({ message: "User (owner) not found!" });
    }
    const newBusiness = new Business({ business_name, address, business_contact, logo_url, user_id });
    const savedBusiness = await newBusiness.save();
    res.status(201).json({ message: "Business created successfully!", data: savedBusiness });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
  }
};

// GET By Id Method of Business...


const getBusinessApi = async(req, res)=>{
  try{
    const getuser = await Business.findById(req.params.id);
    res.status(200).json({message : "Business data getting successfully!", data : getuser});
  }catch(err){
    res.status(500).json({ message: "Something went wrong!"})
   console.error("Server Error :",err);
  }
}

// GET all data Method of Business...


const getBusinessById = async (req, res) => {
  try {
    const getuser = await Business.find({});
    res.status(200).json({ message: "Business data getting successfully!", data: getuser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" })
    console.error("Server Error :", err);
  }
}

// PUT method for businessApi...

const putBusinessApi = async(req, res)=>{
  try{
   const updateBusiness = await Business.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
   if(!updateBusiness) return res.status(400).json({message : "Business data not found!"});
    res.status(200).json({ status: 'Success', message: "Business updated successfully!", response: updateBusiness, status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!"});
    console.log(error);
  }
}

// DELETE Method for businessApi...


const deleteBusinessApi = async(req, res)=>{
   try{
     const deleteBusiness = await Business.findByIdAndDelete(req.params.id);
     if(!deleteBusiness) return res.status(400).json({message : "BusinessUser not found!"});
     res.status(200).json({message : "Business User data deleted successfully!"});
   }catch(err){
     res.status(500).json({message : "Something went wrong!"});
     console.log(err);
   }
};


// Business Count...

const countBusiness = async(req,res)=>{
  try{
    const totalBusinesscount = await Business.countDocuments({});
    res.status(200).json({message : "Total business is :", countTotal : totalBusinesscount});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error is :", error);
  }
}

// POST Category...

const categoryPost = async (req, res) => {
  try {
    const { category_name, logo_url } = req.body;
    const categoryExists = await Category.findOne({ category_name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists!" });
    }
    const newCategory = new Category({ category_name, logo_url });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: "success",
      message: "Category Created Successfully!",
      category: savedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
    console.error(error);
  }
};

// File Uploaded...

const uploadFile = (req, res) =>{
  if (!req.file) return res.status(400).json({ message: " No File Uploaded!" });
  const logoUrl = `http://localhost:7207/uploads/${req.file.filename}`;
  res.json({ message: "File uploaded successfully", logo_url: logoUrl });
}

// Get Image by category Id...

const categoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Category id :", id);
    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    console.log("Image_Url :", category.logo_url);
    res.json({ logo_url: category.logo_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// DeleteCategory Image by category Id...

const deleteCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Category ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    await Category.updateOne({ _id: id }, { $unset: { logo_url: "" } });
    res.json({ message: "Category image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Upload Image by category Id...

const uploadCategoryImage = async (req, res) =>{
  try {
    const { id } = req.params;

    console.log("📌 Received Request to Upload Image for Category:", id);
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    console.log("📌 Multer File Object:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `http://localhost:7207/uploads/${req.file.filename}`;
    category.logo_url = imageUrl;
    await category.save();

    console.log("✅ Image Uploaded Successfully:", imageUrl);

    res.json({
      status: "success",
      message: "Image uploaded successfully",
      logo_url: imageUrl,
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};


// GET method of Category...

const categoryGet = async(req,res)=>{
  try{
    const getCategory = await Category.find({});
    if(!getCategory){
      return res.status(400).json({ message: "Category data not found!" });
    }
    res.status(200).json({status : 'success', message : "Category getting successfully!", category : getCategory});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error", error);
  }
};


// Get category By Id...


const retriveCategory = async(req, res)=>{
  try{
    const findIds = await Category.findById(req.params.id);
    if(!findIds) return res.status(400).json({message : "Category Id not found!"});
    res.status(200).json({message : "Category Id retrive successfully!", data : findIds});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error is :", error);
  }
}

// UPDATE method of Category...

const categoryUpdate = async(req, res)=>{
  try{
   const update_category = await Category.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
   if(!update_category) return res.status(400).json({message : "Category not found!"});
   res.status(200).json({message : "Category name updated successfully!", updated : update_category});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error :", error);
  }
};

const categoryDelete = async(req, res)=>{
  try{
  const delete_category = await Category.findByIdAndDelete(req.params.id);
  if(!delete_category) return res.status(400).json({message : "Category name not found!"});
  res.status(200).json({status : 200, message : "Category deleted successfully!"});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error :", error);
  }
};

const countCategory = async(req, res)=>{
  try{ 
      const countId = await Category.countDocuments(req.params.id);
      if(!countId) res.status(400).json({message : "Category not found!"});
      res.json({message : "Total Category count successfully!", countId});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
}

// Sub_category api creation (POST)


// const createSubcategory = async (req, res) => {
//   try {
//     const { subcategory_name, category_id } = req.body;
//     const existingSubcategory = await Subcategory.findOne({ subcategory_name });
//     if (existingSubcategory) {
//       return res.status(400).json({ message: "Sub-Category name already exists!" });
//     }
//     if (!category_id) {
//       return res.status(400).json({ message: "Category ID is required!" });
//     }
//     const newSub = new Subcategory({
//       subcategory_name,
//       category_id
//     });
//     const savedSub = await newSub.save();
//     res.status(201).json({
//       message: "Subcategory created successfully!",
//       subcategory: savedSub
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       message: "Something went wrong!",
//       error: error.message
//     });
//   }
// };

const createSubcategory = async (req, res) => {
  try {
    const { subcategory_name, category_id } = req.body;
    if (!subcategory_name || !category_id) {
      return res.status(400).json({ message: "Subcategory name and Category ID are required!" });
    }
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found!" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required!" });
    }
    const imageLogoUrl = `http://localhost:7207/uploads/${req.file.filename}`;
    const newSubcategory = new Subcategory({
      subcategory_name,
      category_id,
      image_logo: imageLogoUrl
    });
    const savedSubcategory = await newSubcategory.save();
    res.status(201).json({
      message: "Subcategory created successfully!",
      subcategory: savedSubcategory
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Something went wrong!",
      error: error.message
    });
  }
};


    // Save subcategory to database


    // Get total subcategory of id...


    const GettotalSubcategory = async(req, res)=>{
        try{
           const countSub = await Subcategory.countDocuments(req.params.id);
           if(!countSub) return res.status(400).json({message : "Subcategory id not found!"});
           res.json({message : "Total Subcategory getting successfully!", countSub});
        }catch(error){
          res.status(500).json({message : "Something went wrong!", error :error.message});
        }
    }


// Sub_category api creation (GET)

const getSubcategory = async(req, res)=>{
  try{
    const getSub = await Subcategory.find({});
    res.status(200).json({status : true, message : "Sub-category getting successfully!", subGet : getSub, status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error is :", error);
  }
};

// Subcategory GET by category_id


const getSubbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

     if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({message : 'Invalid category ID!'});
     }
     
     const findSubcategories = await Subcategory.find({category_id : id});

    if (!category) {
      return res.status(400).json({ message: "Category ID not found!" });
    };
    
    // const subcategories = await Subcategory.find({ category_id:  id });
    res.status(200).json({ message: "Subcategory fetching successfully!", category, findSubcategories });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};



// Sub_category By id api creation (PUT) 

const updateSubcategory = async(req, res)=>{
  try{
     const putSub = await Subcategory.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
     if(!putSub) return res.status(400).json({message : "Subcategory Id not found!"});
     res.status(200).json({status : 'success', message : "Sub-Category Updated successfully!", update_category : putSub, status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error is :", error);
  }
}

// Sub_category By Id api creation (DELETE)

const deleteSubcategory = async(req, res)=>{
  try{
    const delSubdata = await Subcategory.findByIdAndDelete(req.params.id);
    if(!delSubdata) return res.status(400).json({message : "Sub-category Id not found!"});
    res.json({ status: 'success', message: "Sub-category deleted successfully!", status_code: 200 });
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
    console.log("Error is :", error);
  }
};


// const subcategoryImage = async(req, res)=>{
//   try{
//     const {id} = req.params;
//     const subcategoryID = await Subcategory.findById(id);
//     if(!subcategoryID) return res.status(400).json({message : "Suncategory ID not found!"});
    
//     if(!req.file) return res.status(400).json({message : "No File uploded!"});
//     const SubImageUrl = `http://localhost/7207/uploads/${req.file.filename}`;
//     subcategoryID.image_url = SubImageUrl;

//     res.json({message : 'Subcategory File uploaded successfully!', sub_image : SubImageUrl.image_url});

//   }catch(error){
//      res.status(500).json({message : "Something went wrong !", error : error.message});
//      console.log("Error :", error);
//   }
// }


// Create Services (POST) Method...

const servicesPost = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // ✅ Debug: Check what is received
    console.log("Uploaded File:", req.file); // ✅ Debug: Check uploaded file
    const { service_name, description, price, business_id, subcategory_id } = req.body;
    if (!price) {
      return res.status(400).json({ message: "Price is required!" });
    }
    const serviceName = await Services.findOne({ service_name });
    if (serviceName) {
      return res.status(400).json({ message: "Service name already exists!" });
    }
    const newServices = new Services({
      service_name,
      description,
      price,
      business_id,
      subcategory_id,
      service_img: req.file ? `http://localhost:7207/uploads/${req.file.filename}` : "",
    });
    const savedService = await newServices.save();
    res.status(201).json({ message: "Service created successfully!", service: savedService });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};
// Get Services (GET) Method...


const getServices = async(req, res)=>{
  try{
    const serviceId = await Services.find({});
    if(!serviceId) return res.status(400).json({message : "Service data not found!"});
    res.status(200).json({message : "Service getting successfully!", serviceId});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};

// Get Services by service_id (GET)...

const getServiceById = async(req, res)=>{
  try{
    const retriveId = await Services.findById(req.params.id);
    if(!retriveId) return res.status(400).json({message : "Service id not found!"});
    res.json({message : "Retrive data successfully!", retriveId});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};

// Update Service (PUT)...


const updateService = async(req, res)=>{
  try{
    const putService = await Services.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
    if(!putService) res.status(400).json({message : "Service category not found!"});
    res.json({ message: "Service data updated successfully!", updateData: putService });
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};

const deleteService = async (req, res) => {
  try {
    const deletedService = await Services.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found!" });
    }
    return res.json({ message: "Service deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};


const countServices = async(req, res)=>{
  try{
     const countService = await Services.countDocuments(req.params.id);
     if(!countService) return res.status(400).json({message : "Service id not found!"});
     res.status(200).json({message : "Services getting successfully!", countService});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};

// Appontment (POST) Api Creation...
const appointmentPost = async(req, res)=>{
  try{
    const { appointment_date, time_slot, service_id, user_id } = req.body;
    if(!appointment_date || !time_slot || !service_id || !user_id){
       return res.status(400).json({message : "All fields are required!"});
    };
    const newAppointment = new Appointment({ appointment_date, time_slot, service_id, user_id, status : 'Pending'});
    const saveAppointment = await newAppointment.save();
    res.status(201).json({status : "success", message : "Appointment created successfully!", saveAppointment, status_code : 201});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};



const appointBookedStatus = async(req, res)=>{
  try{
    const {status} = req.body;
    const statusUpdate = await Appointment.findByIdAndUpdate(req.params.id, { status, updated_at: new Date() }, {new : true});
    if(!statusUpdate) return res.status(400).json({message : "Appointment data not found!"});
    if(!["Pending", "Booked"].includes(status)) return res.status(400).json({ message: "Invalid status!"});
    res.status(200).json({ status: "success", message: "Appointment status updated!", statusUpdate });
  }catch(error){
    res.status(500).json({message : "Somethingwent wrong!", error : error.message});
  }
}


const appointmentGet = async(req, res)=>{
  try{
     const findAll = await Appointment.find({});
     if(!findAll) return res.status(400).json({message : "Appoint data not found!"});
     res.json({status : "success",message : "All appointment data getting successfully!", findAll, status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
}

const appointmentRetrive = async (req, res) => {
  try {
    const findAll = await Appointment.findById(req.params.id);
    if (!findAll) return res.status(400).json({ message: "Appoint data not found!" });
    res.json({status : "success", message: "Single appointment data getting successfully!", findAll, status_code : 200});
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
}


const appointmentPut = async (req, res) => {
  try {
    const findAll = await Appointment.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
    if (!findAll) return res.status(400).json({ message: "Appoint data not found!" });
    res.json({ message: "Appointment data Updated successfully!", findAll }); 
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
}

const appointmentDelete = async(req, res)=>{
  try{
      const delappoint = await Appointment.findByIdAndDelete(req.params.id);
      if(!delappoint) return res.status(400).json({message : "Appointment id not found!"});
      res.json({message : "Appointment deleted successfully!"}); 
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};


const cancelled = async(req, res)=>{
  try{
    const cancel = await Appointment.findById(req.params.id);
    if(!cancel) return res.status(400).json({status : "error" ,message : "Appointment not found!"});

    if(cancel.status === "Cancelled") return res.status({message : "Appointment already cancelled"});

    cancel.status = "Cancelled";
    cancel.updated_at = new Date().toISOString();
    await cancel.save();
    res.json({status : "success", message : "Appointment cancelled successfully!", status_code : 200, cancel});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};

const schedule = async (req, res) => {
  try {
    const { appointment_date, time_slot } = req.body;

    if (!appointment_date || !time_slot) {
      return res.status(400).json({ status: "error", message: "Appointment date and time slot are required!" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ status: "error", message: "Appointment not found!" });

    // ✅ Allow rescheduling of cancelled appointments
    if (appointment.status === "Cancelled") {
      appointment.status = "Scheduled";  // Change status to Scheduled
    }

    appointment.appointment_date = appointment_date;
    appointment.time_slot = time_slot;
    appointment.updated_at = new Date();
    await appointment.save();

    res.status(200).json({
      status: "success",
      message: "Appointment rescheduled successfully!",
      appointment,
      status_code: 200
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Something went wrong!", error: error.message });
  }
};


// Payment Api creation...

const paymentPost = async (req, res) => {
  try {
    const { appointment_id, amount, payment_method } = req.body;

    if (!appointment_id || !amount || !payment_method) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const newPay = new Payment({
      appointment_id,
      amount,
      payment_method,
      status: "Pending",
      payment_id: uuidv4(),
    });

    const savePay = await newPay.save();

    res.status(201).json({
      status: "success",
      message: "Payment initiated successfully!",
      payment: savePay,
      status_code: 201,
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

const paymentVerify = async (req, res) => {
  try {
    const { payment_id } = req.body;
    console.log("Received Payment ID:", payment_id);

    if (!payment_id) {
      return res.status(400).json({ status: "error", message: "Payment ID is required" });
    };

    const payment = await Payment.findOne({ payment_id });
    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment not found" });
    }
    const updatedPayment = await Payment.findOneAndUpdate(
      { payment_id },
      { status: "Paid", updated_at: Date.now()},
      { new: true },
    );

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully!",
      payment_status: updatedPayment.status,
      payment: updatedPayment,
      status_code: 200,
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error", error: error.message });
  }
};


const paymentRefund = async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ message: "Payment ID is required!" });
    }

    // Find the payment record
    const paymentData = await Payment.findOne({ payment_id });
    if (!paymentData) {
      return res.status(404).json({ message: "Payment not found!" });
    }

    // Check if already refunded
    if (paymentData.status === "Refunded") {
      return res.status(400).json({ message: "Payment has already been refunded!" });
    }

    // Only allow refunds for "Paid" payments
    if (paymentData.status !== "Paid") {
      return res.status(400).json({ message: "Only paid transactions can be refunded!" });
    }

    // Mark payment as refunded
    paymentData.status = "Refunded";
    paymentData.updated_at = new Date();
    await paymentData.save();

    // Find the associated appointment using `appointment_id`
    const appointment = await Appointment.findOne({ _id: paymentData.appointment_id });
    if (appointment) {
      appointment.status = "Cancelled";
      appointment.updated_at = new Date();
      await appointment.save();
    }

    res.status(200).json({
      status: "success",
      message: "Refund processed successfully and appointment cancelled!",
      payment: paymentData,
      appointment,
      status_code: 200
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error", error: error.message });
  }
};


const paymentHistory = async (req, res) => {
  try {
    const { user_id, business_id } = req.query;

    let filter = {};
    if (user_id) filter.user_id = user_id;
    if (business_id) filter.business_id = business_id;

    const transactions = await Payment.find(filter);

    res.status(200).json({
      status: "success",
      transactions,
      status_code: 200
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error", error: error.message });
  }
}

const paymentDel = async(req, res)=>{
  try{
    const ids = await Payment.findByIdAndDelete(req.params.id);
    if(!ids) return res.status(400).json({message : "Payment id not found!"});
    res.json({message : "Payment deleted successfully!"});
  }catch(error){
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

const paymentGet = async (req, res) => {
  try {
    const ids = await Payment.find({});
    if (!ids) return res.status(400).json({ message: "Payment data not found!" });
    res.json({ message: "Payment getting successfully!", ids});
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

// Review POST created...

const reviewPost = async(req, res)=>{
  try{
    const { comment, rating, service_id, user_id } = req.body;
    const newReview = new Review({ comment, rating, service_id, user_id });
    const saveReview = await newReview.save();
    res.status(201).json({status : "success", message : "Review created successfully!", review : saveReview, status_code : 201});
  }catch(error){
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

const reviewGetById = async(req, res)=>{
  try{
     const sIds = await Review.findOne({});
     if(!sIds) return res.status({status : "error", message : "review data not found!"});
     const ids = await Services.findById(req.params.id);
     if (!ids) return res.status(400).json({ status: "error", message: "Service Id not found!" });
     res.status(200).json({status : "success", message : "Review dats retriving successfully!", review : sIds, status_code : 200});
  }catch(error){
    res.status(500).json({ message: "Something went wrong!", error: error.message });

  }
};

const reviewPutById = async(req, res) => {
  try {
    const id = await Review.findByIdAndUpdate(req.params.id, {$set : req.body}, {new : true});
    if (!id) res.status(400).json({ message: "Review id not found!" });
    res.status(200).json({ status: "success", message: "review updated successfully!", update : id, status_code : 200});
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });

  }
};


const reviewCount = async(req, res)=>{
  try{
    const count = await Review.countDocuments({});
    if(!count) res.status(400).json({status : "error", message : "Review data not found!"});
    res.status(200).json({status : 'success', message : "Total Review found!", count, status_code : 200});
  }catch(error){
    res.status(500).json({status : "error", message : "Something went wrong!", error : error.message});
  }
};

const reviewGet = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user_id", "name") // Populating user name
      .populate("service_id", "service_name"); // Populating service name

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ status: "error", message: "No reviews found!" });
    }
    const formattedReviews = reviews.map((review) => ({
      review_id: review._id,
      user_id: review.user_id,
      service_id: review.service_id,
      user_name: review.user_id?.name || "Unknown",
      service_name: review.service_id?.service_name || "Unknown",
      rating: review.rating,
      comment : review.comment,
      review_text: review.review_text,
      created_at: review.created_at,
    }));

    res.status(200).json({
      status: "success",
      message: "All review data retrieved successfully!",
      reviews: formattedReviews,
      status_code: 200
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Something went wrong!", error: error.message });
  }
};




const reviewDel = async(req, res)=>{
  try{
  const del = await Review.findByIdAndDelete(req.params.id);
  if(!del) return re.status(400).json({status : "error", message : "Review data not found!"});
  res.json({status : "success", message : "Review data deleted successfully!", status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
};


// Notification POST api creation...

const notifyPost = async(req, res)=>{
  try{
    const { user_id, message } = req.body;
     if(!user_id || !message) return res.status(400).json({message : "Notification User Id and message required!"});
    const notification = new Notificaton({ user_id, message });
     const savenotification = await notification.save();
    res.status(201).json({ status: "success", message: "Notification created successfully!", notification: savenotification, status_code : 201});
  }catch(error){
    res.status(500).json({status : "error", message : "Something went wrong!", error : error.message});
  }
}

const notifyGet = async(req, res)=>{
  try{
   const findAllnotify = await Notificaton.find({});
   if(!findAllnotify) return res.status(400).json({status: 'error', message : "Notification data not found!"});
   const retnotify = findAllnotify.map((data)=> ({
      _id : data._id,
      user_id : data.user_id,
      message : data.message
    }))
    res.status(200).json({ status: "success", message: "Notification retriving successfully!", notify: retnotify, status_code : 200});
  }catch(error){
    res.status(500).json({message : "Something went wrong!", error : error.message});
  }
}

const notifyDel = async(req, res) => {
  try {
    const del = await Notificaton.findByIdAndDelete(req.params.id);
    if (!del) return re.status(400).json({ status: "error", message: "Review data not found!" });
    res.json({ status: "success", message: "Notification data deleted successfully!", status_code: 200 });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

module.exports = {
  register,
  login,
  usersListings,
  retrieve,
  forgotpass,
  newandconfirm,
  verifyEmail,
  userCount,
  deleteuser,
  updateuser,
  businessCategoryApi,
  getBusinessApi,
  putBusinessApi,
  deleteBusinessApi,
  countBusiness,
  categoryPost,
  categoryGet,
  categoryUpdate,
  categoryDelete,
  createSubcategory,
  getSubcategory,
  getSubbyId,
  getBusinessById,
  updateSubcategory,
  deleteSubcategory,
  categoryImage,
  retriveCategory,
  deleteCategoryImage,
  uploadCategoryImage,
  uploadFile,
  servicesPost,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  countCategory,
  GettotalSubcategory,
  countServices,
  appointmentPost,
  appointmentDelete,
  appointmentGet,
  appointmentRetrive,
  appointmentPut,
  cancelled,
  schedule,
  paymentPost,
  paymentDel,
  paymentVerify,
  paymentGet,
  appointBookedStatus,
  paymentRefund,
  paymentHistory,
  reviewPost,
  reviewGetById,
  reviewPutById,
  reviewCount,
  reviewGet,
  reviewDel,
  notifyPost,
  notifyGet,
  notifyDel
};
