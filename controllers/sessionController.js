const catchAsyncError = require("../middleware/catchAsyncError");
const Session = require("../models/sessionModel");
const User=require("../models/userModel");

exports.createSession = catchAsyncError(async (req, res, next) => {
    const {
        username,
        email,
        chatbotId
    } = req.body;

    if (!username || !email || !chatbotId) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields"
        });
    }


    // chatbot exists

    const chatbot = await User.findById(chatbotId);


    if (!chatbot) {
        return res.status(404).json({
            success: false,
            message: "Chatbot not found"
        });
    }




    const session = await Session.create({
        username,
        email,
        chatbotId
    });

    res.status(200).json({
        success: true,
        session,
        message: "Session created successfully"
    });

});


exports.getAllSessions = catchAsyncError(async (req, res, next) => {
    const user=req.user;

    const sessions = await Session.find({ chatbotId: user._id });

    res.status(200).json({
        success: true,
        sessions
    });

});



