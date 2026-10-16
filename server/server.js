import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import Message from "./models/Message.js";
import { checkEventNotifications } from "./utils/eventNotificationScheduler.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://connect-event-iota.vercel.app",
].filter(Boolean);

// ==============================
// MIDDLEWARE
// ==============================
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==============================
// SOCKET.IO
// ==============================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make Socket.IO accessible to routes/controllers if needed.
app.set("io", io);

// ==============================
// API ROUTES
// ==============================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Connect Event API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);

// ==============================
// SOCKET.IO CHAT
// ==============================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_event", (eventId) => {
    if (eventId) {
      socket.join(`/events/${eventId}/chat`);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const { eventId, sender, message } = data || {};

      if (!eventId || !sender || !message?.trim()) {
        socket.emit("message_error", {
          message: "Event, sender, and message are required",
        });
        return;
      }

      const savedMessage = await Message.create({
        event: eventId,
        sender,
        message: message.trim(),
      });

      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("sender", "name email");

      io.to(`/events/${eventId}/chat`).emit(
        "receive_message",
        populatedMessage
      );
    } catch (error) {
      console.error("Socket message error:", error);

      socket.emit("message_error", {
        message: "Failed to send message",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ==============================
// ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ==============================
// START SERVER
// ==============================
const startServer = async () => {
  try {
    await connectDB();

    // Run event notifications after the database connection succeeds.
    const runEventNotificationCheck = async () => {
      try {
        await checkEventNotifications();
      } catch (error) {
        console.error("Event notification scheduler error:", error);
      }
    };

    await runEventNotificationCheck();

    // Check every 6 hours while this server process is running.
    setInterval(runEventNotificationCheck, 6 * 60 * 60 * 1000);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();