const User = require('../models/userModel');
const catchAsyncError = require('../middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');


require('dotenv').config();


// register a user 
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Create a new user
    const user = await User.create({
        name,
        email,
        password,
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
            message: 'Please enter email & password',
        });
    }

    // finding user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Email or Password',
        });
    }

    // check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Email or Password',
        });
    }

    // send token in cookie
    sendToken(user, 200, res , message = "User logged in successfully");
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
    const user = await User.findById(userId );
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    // Send response with user's profile
    res.status(200).json({
        success: true,
        user,
    });
} );
