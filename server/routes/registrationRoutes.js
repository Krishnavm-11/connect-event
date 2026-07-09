import express from "express";
import {
  registerForEvent, cancelRegistration, getMyRegistrations, getEventAttendees
} from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:eventId", protect, registerForEvent);

router.delete("/:eventId", protect, cancelRegistration);

router.get("/my-events", protect, getMyRegistrations);

router.get(
  "/event/:eventId/attendees",
  protect,
  getEventAttendees
);

export default router;