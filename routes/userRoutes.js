const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  loadUserProfile,
  addBussinessDetails,
  deleteBussinessDetails,
  generateNewToken
} = require("../controllers/userController");

const { isAuthenticatedUser } = require("../middleware/Auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/bussinessDetails").post(isAuthenticatedUser, addBussinessDetails);
router.route("/businessDetails/:id").delete(isAuthenticatedUser, deleteBussinessDetails);
router.route("/token").post(isAuthenticatedUser, generateNewToken);

// user profile route
router
  .route("/me")
  .get(isAuthenticatedUser, loadUserProfile);

module.exports = router;
