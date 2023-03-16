import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  addPost,
  getPostsWithPreference,
  getProfilePosts,
  deletePost,
  updatePostVisibility,
  addComment,
  addLike,
  removeLike,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protect, getPostsWithPreference);
router.post("/", protect, addPost);
router.delete("/", protect, deletePost);
router.put("/", protect, updatePostVisibility);
router.get("/profile", protect, getProfilePosts);
router.post("/comment", protect, addComment);
router.post("/like", protect, addLike);
router.delete("/like", protect, removeLike);
export default router;
