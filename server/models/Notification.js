import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    type: {
      type: String,
      enum: ["event_reminder", "event_expired"],
      default: undefined,
    },

    dedupeKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);