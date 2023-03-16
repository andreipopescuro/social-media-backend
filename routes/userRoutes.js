import express from "express";
import {
  acceptFriendRequest,
  changeProfilePic,
  changeUserInfo,
  changeUserSettings,
  deleteFriend,
  getFriends,
  getUserAbout,
  getUserInfo,
  getUserPosts,
  getUsers,
  updateFriendRequests,
  loginUser,
  registerUser,
  rejectFriendRequest,
  getUserSettings,
  deleteFriendReqeust,
  addFriendRequest,
  getFriendRequests,
  getNotifications,
  updateViewedNotifications,
  recommedFriends,
} from "../controllers/userController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);

router.get("/friends", protect, getFriends);
router.get("/posts", protect, getUserPosts);

router.get("/settings", protect, getUserSettings);
router.put("/settings", protect, changeUserSettings);

router.get("/about", protect, getUserAbout);
router.put("/about", protect, changeUserInfo);

router.get("/info", protect, getUserInfo);
router.put("/changeProfilePic", protect, changeProfilePic);

router.get("/friendRequests", protect, getFriendRequests);
router.put("/friendRequests", protect, updateFriendRequests);

router.get("/notifications", protect, getNotifications);
router.put("/notifications", protect, updateViewedNotifications);

router.post("/friendRequest", protect, addFriendRequest);
router.delete("/friendRequest", protect, deleteFriendReqeust);

router.get("/recommended", protect, recommedFriends);

router.post("/acceptRequest", protect, acceptFriendRequest);
router.post("/rejectRequest", protect, rejectFriendRequest);

router.delete("/friend", protect, deleteFriend);

export default router;
