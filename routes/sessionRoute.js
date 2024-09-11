const express = require("express");
const router = express.Router();
const {
    createSession,
    getAllSessions
} = require("../controllers/sessionController");

const { isAuthenticatedUser } = require("../middleware/Auth");

// POST -> create a session
// URL -> /api/v1/session/create
// Description -> Create a session by guest
// Request Body -> username, email, chatbotId


router.route("/create").post(createSession);


// GET -> get All sessions
// URL -> /api/v1/session/owner
// Description -> Get all sessions of a chatbot by chatbot owner from dashboard




router.route("/owner").get(isAuthenticatedUser,getAllSessions);




module.exports = router;

