import express from "express";
import {
  getAdminStats, getAllEventsAdmin, approveEvent, rejectEvent, getAllUsersAdmin, getAllOrganizersAdmin,
  toggleOrganizerStatus, getAllRegistrationsAdmin
} from "../controllers/adminController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, admin, getAdminStats);
router.get("/events", protect, admin, getAllEventsAdmin);

router.put("/events/:id/approve", protect, admin, approveEvent);
router.put("/events/:id/reject", protect, admin, rejectEvent);
router.get("/users", protect, admin, getAllUsersAdmin);
router.get("/organizers", protect, admin, getAllOrganizersAdmin);
router.put("/organizers/:id", protect, admin, toggleOrganizerStatus);
router.get("/registrations", protect, admin, getAllRegistrationsAdmin);

export default router;