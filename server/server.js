import express from "express";
import dotenv from "dotenv";
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
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import Message from "./models/Message.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Frontend URLs allowed to access the backend
const allowedOrigins = [
  "http://localhost:5173",
  "https://connect-event-iota.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Event Networking API Running");
});

io.on("connection", (socket) => {
  socket.on("join_event", (eventId) => {
    socket.join(eventId);
  });

  socket.on("send_message", async (data) => {
    try {
      const savedMessage = await Message.create({
        sender: data.sender,
        event: data.event,
        message: data.message,
      });

      const populatedMessage = await Message.findById(
        savedMessage._id
      ).populate("sender", "name email profession profileImage");

      io.to(data.event).emit("receive_message", populatedMessage);
    } catch (error) {
      socket.emit("message_error", {
        message: error.message,
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});