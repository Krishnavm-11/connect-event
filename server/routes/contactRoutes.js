import express from "express";
import { sendContactMessage, getAllContactMessages, markContactAsRead } from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", sendContactMessage);

router.get("/", protect, admin, getAllContactMessages);

router.put("/:id/read", protect, admin, markContactAsRead);

export default router;