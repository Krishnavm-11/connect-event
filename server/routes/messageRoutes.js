import express from "express";
import { getEventMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/event/:eventId", protect, getEventMessages);

export default router;