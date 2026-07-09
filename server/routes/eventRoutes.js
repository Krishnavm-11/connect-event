import express from "express";
import {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent, getMyOrganizerEvents
} from "../controllers/eventController.js";
import upload from "../middleware/upload.js";
import { protect, organizer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/my-events", protect, organizer, getMyOrganizerEvents);
router.get("/:id", getEventById);

router.post("/", protect, organizer, upload.single("banner"), createEvent);
router.put("/:id", protect, organizer, updateEvent);
router.delete("/:id", protect, organizer, deleteEvent);

export default router;