import mongoose from "mongoose";

const seatReservationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seatNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },

    status: {
      type: String,
      enum: ["held", "booked"],
      default: "held",
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

seatReservationSchema.index(
  { event: 1, seatNumber: 1 },
  { unique: true }
);

export default mongoose.model(
  "SeatReservation",
  seatReservationSchema
);