import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  addNotification,
  getNotifications,
} from "../controllers/notificationController.js";

// no request in this route yet

const router = express.Router();

router.post("/", addNotification);
router.get("/", getNotifications);

export default router;
