import express from "express";

import {
  sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest,
  getPendingRequests, getMyConnections, getNetworkingSuggestions,
} from "../controllers/connectionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/suggestions/:eventId", protect, getNetworkingSuggestions);

router.post("/send/:receiverId", protect, sendConnectionRequest);

router.get("/requests", protect, getPendingRequests);

router.put("/accept/:id", protect, acceptConnectionRequest);

router.put("/reject/:id", protect, rejectConnectionRequest);

router.get("/my-connections", protect, getMyConnections);

export default router;