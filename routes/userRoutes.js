const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  loadUserProfile,
} = require("../controllers/userController");

const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

// user profile route
router
  .route("/me")
  .get(isAuthenticatedUser, loadUserProfile);

module.exports = router;
