const express = require('express');
const router = express.Router();
const upload = require('../uploadImage/ImageUpload');
const { notifyDel ,notifyGet,notifyPost ,reviewDel ,reviewGet ,reviewCount ,reviewPutById ,reviewGetById ,reviewPost ,paymentHistory ,paymentRefund ,appointBookedStatus ,paymentGet ,paymentVerify ,paymentDel ,paymentPost,schedule ,cancelled ,appointmentPut ,appointmentRetrive ,appointmentGet ,appointmentDelete ,appointmentPost ,countServices ,GettotalSubcategory ,countCategory ,deleteService, updateService ,getServiceById ,getServices ,servicesPost ,uploadFile ,uploadCategoryImage ,deleteCategoryImage ,categoryImage, retriveCategory ,register, login, usersListings, retrieve, forgotpass, newandconfirm, verifyEmail, userCount, deleteuser, updateuser, businessCategoryApi, getBusinessApi, getBusinessById, putBusinessApi, deleteBusinessApi, categoryPost, categoryGet, categoryUpdate, categoryDelete, countBusiness, createSubcategory, getSubcategory, getSubbyId, updateSubcategory, deleteSubcategory } = require('../controllers/authControllers');

router.post('/registration', register);
router.post('/login', login);
router.post('/verify', verifyEmail);
router.post('/forgot', forgotpass);
router.post('/newpass', newandconfirm);
router.post('/business', businessCategoryApi);
router.post('/category', categoryPost);
router.get('/get_category', categoryGet)
router.put('/update_category/:id', categoryUpdate);
router.delete('/delete_category/:id', categoryDelete);
router.post('/subcreate/:id', upload.single("logo"), createSubcategory);
router.get('/subget', getSubcategory);
router.put('/subput/:id', updateSubcategory);
router.delete('/subdel/:id', deleteSubcategory);
router.get('/subcategory/:id', getSubbyId);
router.get('/alluser', usersListings);
router.get('/retrive/:id', retrieve);
router.get('/total', userCount);
router.get('/getbusiness/:id', getBusinessApi);
router.get('/getallbusiness', getBusinessById);
router.delete('/delusers/:id', deleteuser);
router.delete('/delbusiness/:id', deleteBusinessApi);
router.get('/businessCount', countBusiness)
router.put('/updateUser/:id', updateuser);
router.put('/updateBusiness/:id', putBusinessApi);
router.get("/category/image/:id", categoryImage);
router.get('/category/:id', retriveCategory);
router.delete("/category/image/:id", deleteCategoryImage);
router.post("/category/upload/:id", upload.single("logo"), uploadCategoryImage);
router.post("/upload", upload.single("logo"), uploadFile);
router.post('/service', upload.single("logo"), servicesPost);
router.get('/getservice', getServices);
router.get('/serviceid/:id', getServiceById);
router.put('/putservice/:id', updateService);
router.delete('/delservice/:id', deleteService)
router.get('/totalcategory', countCategory);
router.get('/totalSubcategory', GettotalSubcategory);
router.get('/totalService', countServices),
router.post('/appointment', appointmentPost);
router.delete('/delappoint/:id', appointmentDelete);
router.get('/getappoint', appointmentGet);
router.get('/getappointbyid/:id', appointmentRetrive);
router.put('/putappoint/:id', appointmentPut)
router.put('/cancel/:id', cancelled)
router.put('/schedule/:id', schedule);
router.put('/putbook/:id', appointBookedStatus);
router.post("/payment", paymentPost);
router.post("/payfy", paymentVerify);
router.delete('/delpayment/:id', paymentDel)
router.get('/getpay', paymentGet);
router.post('/refund', paymentRefund);
router.get('/history', paymentHistory);
router.post('/review', reviewPost);
router.get('/review/:id', reviewGetById);
router.put('/reviewput/:id', reviewPutById);
router.get('/reviewcount', reviewCount);
router.get('/reviewget', reviewGet);
router.delete('/reviewdel/:id', reviewDel);
router.post('/notify', notifyPost);
router.get('/getnotify/:id', notifyGet);
router.delete('/delnotify/:id', notifyDel)
// router.post("/subimage/:id", upload.single("logo"), subcategoryImage);


router.get("/ping", (req, res) => {
  res.json({ message: "Backend is working!" });
  console.log("Backend is working!");
});

module.exports = router;
