const User = require("../models/userModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const { generateToken } = require("../utils/chatbotToken");

require("dotenv").config();

// register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    picture,
    bussinessName,
    bussinessDescription,
    bussinessCategory,
  } = req.body;

  const userExists=await User.findOne({email});


  if(userExists){
    return res.status(400).json({
      success:false,
      message:"User already exists"
    });
  }



  // token for user to access the chatbot and other services

  const chatbot_token= await generateToken();





  // Create a new user
  const user = await User.create({
    name,
    email,
    password,
    picture,
    bussinessName,
    bussinessCategory,
    bussinessDescription,
    chatbot_token,
  });

  // Send token in cookie
  sendToken(user, 200, res, "User registered successfully");
});
// login a user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password is entered by user
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email & password",
    });
  }

  // finding user in database
  const user = await User.findOne({ email }).select("+password");




  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }

  // check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }

  // send token in cookie
  sendToken(user, 200, res, (message = "User logged in successfully"));
});

// logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(0),
    path: "/",
    secure: true,
    sameSite: "None",
  });

  // Set Cache-Control header to prevent caching
  res.setHeader("Cache-Control", "no-store");

  console.log("Cookie cleared.");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// load user profile
exports.loadUserProfile = catchAsyncError(async (req, res, next) => {
  // Get the user ID from the request parameters or authentication token
  const userId = req.params.userId || req.user._id;

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  // Send response with user's profile
  res.status(200).json({
    success: true,
    user,
  });
});



// add business details
exports.addBussinessDetails = catchAsyncError(async (req, res, next) => {
  const { question, answer } = req.body;

  const user=req.user;  
  const bussinessDetails = user.bussinessDetails;

  if (!question || !answer) {

    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  if (bussinessDetails.length >= 15) {
    return res.status(400).json({
      success: false,
      message: "Details limit reached.You can't add more details",
    });
  }

  bussinessDetails.push({ question, answer });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Bussiness details added successfully",
  });
});


exports.deleteBussinessDetails=catchAsyncError(async(req,res,next)=>{
  const user=req.user;
  const {id}=req.params;

  const bussinessDetails=user.bussinessDetails;

  const index=bussinessDetails.findIndex((bussinessDetail)=>bussinessDetail._id===id);

  if(index>-1){
    bussinessDetails.splice(index,1);
  }

  await user.save();

  res.status(200).json({
    success:true,
    message:"Bussiness details deleted successfully"
  });

});


// Generate  new token for chatbot and replace the old token

exports.generateNewToken=catchAsyncError(async(req,res,next)=>{
  const user=req.user;

  const token=await User.generateToken();

  user.token=token;

  await user.save();

  res.status(200).json({
    success:true,
    message:"New token generated successfully"
  });
})