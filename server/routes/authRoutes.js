
import express from "express";

import {
  registerUser,
  verifyRegistrationOTP,
  loginUser,
  verifyLoginOTP,
  resendRegistrationOTP,
  resendLoginOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register/verify-otp", verifyRegistrationOTP);
router.post("/register/resend-otp", resendRegistrationOTP);

router.post("/login", loginUser);
router.post("/login/verify-otp", verifyLoginOTP);
router.post("/login/resend-otp", resendLoginOTP);

export default router;
