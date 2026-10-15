
import mongoose from "mongoose";

const emailOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["register", "login"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    // Only used for pending registration.
    registrationData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

emailOTPSchema.index({ email: 1, purpose: 1 });

export default mongoose.model("EmailOTP", emailOTPSchema);
