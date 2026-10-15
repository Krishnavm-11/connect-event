import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    selectedSeats: {
      type: [Number],
      required: true,
      validate: {
        validator: (seats) =>
          Array.isArray(seats) &&
          seats.length >= 1 &&
          seats.length <= 5 &&
          new Set(seats).size === seats.length,
        message: "Select between 1 and 5 unique seats.",
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "free", "failed"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    reservationExpiresAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "registered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Registration", registrationSchema);