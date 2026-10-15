
import User from "../models/User.js";
import EmailOTP from "../models/EmailOTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profession: user.profession,
  interests: user.interests,
  token: generateToken(user._id),
});

const createAndSendOTP = async ({
  email,
  purpose,
  registrationData = null,
}) => {
  const existingOTP = await EmailOTP.findOne({ email, purpose });

  if (
    existingOTP &&
    Date.now() - existingOTP.createdAt.getTime() < RESEND_WAIT_MS
  ) {
    const secondsLeft = Math.ceil(
      (RESEND_WAIT_MS -
        (Date.now() - existingOTP.createdAt.getTime())) /
        1000
    );

    const error = new Error(
      `Please wait ${secondsLeft} seconds before requesting another code`
    );
    error.statusCode = 429;
    throw error;
  }

  await EmailOTP.deleteMany({ email, purpose });

  const otp = String(randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 10);

  const otpRecord = await EmailOTP.create({
    email,
    purpose,
    otpHash,
    registrationData,
    attempts: 0,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  try {
    await sendOTPEmail(email, otp, purpose);
  } catch (error) {
    await EmailOTP.deleteOne({ _id: otpRecord._id });
    throw error;
  }
};

const verifyOTP = async (email, purpose, otp) => {
  const record = await EmailOTP.findOne({ email, purpose });

  if (!record || record.expiresAt.getTime() <= Date.now()) {
    if (record) await EmailOTP.deleteOne({ _id: record._id });

    const error = new Error("OTP expired or not found. Request a new code.");
    error.statusCode = 400;
    throw error;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await EmailOTP.deleteOne({ _id: record._id });

    const error = new Error("Too many attempts. Request a new OTP.");
    error.statusCode = 429;
    throw error;
  }

  const matches =
    typeof otp === "string" &&
    /^\d{6}$/.test(otp) &&
    (await bcrypt.compare(otp, record.otpHash));

  if (!matches) {
    record.attempts += 1;
    await record.save();

    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  await EmailOTP.deleteOne({ _id: record._id });
  return record;
};

// STEP 1: Validate registration data and send OTP.
// The user account is NOT created at this stage.
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Enter a valid name and email. Password must be at least 8 characters.",
      });
    }

    // Public registration must never create admin accounts.
    const selectedRole = role || "user";

    if (!["user", "organizer"].includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid registration role",
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    if (
      interests !== undefined &&
      !Array.isArray(interests) &&
      typeof interests !== "string"
    ) {
      return res.status(400).json({
        message: "Interests must be a list",
      });
    }

    const interestsList = Array.isArray(interests)
      ? interests
      : typeof interests === "string"
        ? interests.split(",")
        : [];

    const registrationData = {
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: selectedRole,
      // Profession remains supported for existing profile features,
      // but registration no longer asks for it.
      profession: "",
      interests: interestsList
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20),
    };

    await createAndSendOTP({
      email: normalizedEmail,
      purpose: "register",
      registrationData,
    });

    return res.status(200).json({
      message: "Verification code sent to your email",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Registration OTP error:", error.message);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Unable to send verification email. Check your email configuration and try again.",
    });
  }
};

// STEP 2: Verify registration OTP, then create the account.
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!email || typeof otp !== "string") {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const record = await verifyOTP(email, "register", otp);
    const data = record.registrationData;

    if (!data) {
      return res.status(400).json({
        message: "Registration data not found. Please register again.",
      });
    }

    // Check again in case another registration completed meanwhile.
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const user = await User.create(data);

    return res.status(201).json(publicUser(user));
  } catch (error) {
    console.error("Registration verification error:", error.message);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : error.code === 11000
          ? "An account with this email already exists"
          : "Unable to verify registration",
    });
  }
};

// STEP 1: Validate password and send a login OTP.
// Do not issue the JWT yet.
export const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    await createAndSendOTP({
      email,
      purpose: "login",
    });

    return res.status(200).json({
      message: "Login verification code sent to your email",
      email,
    });
  } catch (error) {
    console.error("Login OTP error:", error.message);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Unable to send verification email. Try again later.",
    });
  }
};

// STEP 2: Verify login OTP and issue the JWT.
export const verifyLoginOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!email || typeof otp !== "string") {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    await verifyOTP(email, "login", otp);

    // Ensure the account still exists after OTP verification.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please log in again.",
      });
    }

    return res.json(publicUser(user));
  } catch (error) {
    console.error("Login verification error:", error.message);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Unable to verify login",
    });
  }
};

// Resend endpoints use the same credentials/data as the initial request.
export const resendRegistrationOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const record = await EmailOTP.findOne({
      email,
      purpose: "register",
    });

    if (!record || !record.registrationData) {
      return res.status(400).json({
        message: "Registration session expired. Please register again.",
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    await createAndSendOTP({
      email,
      purpose: "register",
      registrationData: record.registrationData,
    });

    return res.json({ message: "A new OTP has been sent" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Unable to resend OTP",
    });
  }
};

export const resendLoginOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    // Only resend when a valid login OTP session already exists.
    const record = await EmailOTP.findOne({
      email,
      purpose: "login",
    });

    if (!record) {
      return res.status(400).json({
        message: "Login session expired. Enter your password again.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid login session",
      });
    }

    await createAndSendOTP({ email, purpose: "login" });

    return res.json({ message: "A new OTP has been sent" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Unable to resend OTP",
    });
  }
};
