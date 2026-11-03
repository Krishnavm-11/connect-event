
import express from "express";

import {
  registerUser,
  verifyRegistrationOTP,
  loginUser,
  resendRegistrationOTP,
} from "../controllers/authController.js";

const router = express.Router();

// Registration with OTP
router.post("/register", registerUser);
router.post("/register/verify-otp", verifyRegistrationOTP);
router.post("/register/resend-otp", resendRegistrationOTP);

// Login without OTP
router.post("/login", loginUser);

export default router;
