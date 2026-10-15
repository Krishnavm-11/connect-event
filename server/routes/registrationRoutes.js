import express from "express";

import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  getEventSeats,
  verifyRegistrationPayment,
  getTicket,
} from "../controllers/registrationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-events", protect, getMyRegistrations);

router.get(
  "/event/:eventId/seats",
  protect,
  getEventSeats
);

router.get(
  "/event/:eventId/attendees",
  protect,
  getEventAttendees
);

router.get(
  "/ticket/:registrationId",
  protect,
  getTicket
);

router.post(
  "/verify-payment",
  protect,
  verifyRegistrationPayment
);

router.post("/:eventId", protect, registerForEvent);

router.delete("/:eventId", protect, cancelRegistration);

export default router;