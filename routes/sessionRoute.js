const express = require("express");
const router = express.Router();
const {
    createSession,
    getAllSessions,
    getMonthlySessions
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


// GET -> get All number of sessions in a month for  all  months
// URL -> /api/v1/session/monthly
// Description -> Get all sessions of a chatbot by chatbot owner from dashboard

router.route("/monthly").get(isAuthenticatedUser,getMonthlySessions);
 
module.exports = router;

