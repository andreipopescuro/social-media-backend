import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Like from "../models/likeModel.js";
export const getPostsWithPreference = async (req, res) => {
  const visibility = req.query.visibility;
  try {
    if (visibility === "global") {
      const user = await User.findById(req.user._id);
      const friendIds = user.friends.map((friend) => friend._id);
      const posts = await Post.find({
        $or: [
          { visibility: "global" },
          {
            user: { $in: friendIds },
            visibility: { $in: ["global", "friends"] },
          },
        ],
        user: { $ne: req.user._id },
      })
        .sort({ createdAt: -1 })
        .populate("user", "name pic")
        .populate({
          path: "comments",
          populate: {
            path: "user",
            select: "pic name",
          },
        })
        .populate({
          path: "likes",
          populate: {
            path: "user",
            select: "pic name",
          },
        });

      const updatedPosts = posts.map((post) => {
        const liked = post.likes.some((like) => {
          return like.user._id.toString() === req.user._id.toString();
        });

        const likeId = post.likes.find((like) => {
          return like.user._id.toString() === req.user._id.toString();
        })?._id;

        return {
          ...post.toObject(),
          liked: liked ? { status: true, likeId } : false,
        };
      });

      return res.status(200).json(updatedPosts);
    }
    if (visibility === "friends") {
      const user = await User.findById(req.user._id);
      const friendIds = user.friends.map((friend) => friend._id);
      const posts = await Post.find({
        user: { $in: friendIds },
        visibility: { $in: ["global", "friends"] },
      })
        .sort({ createdAt: -1 })
        .populate("user", "name pic")
        .populate({
          path: "comments",
          populate: {
            path: "user",
            select: "pic name",
          },
        })
        .populate({
          path: "likes",
          populate: {
            path: "user",
            select: "pic name",
          },
        });
      const updatedPosts = posts.map((post) => {
        const liked = post.likes.some((like) => {
          return like.user._id.toString() === req.user._id.toString();
        });

        const likeId = post.likes.find((like) => {
          return like.user._id.toString() === req.user._id.toString();
        })?._id;

        return {
          ...post.toObject(),
          liked: liked ? { status: true, likeId } : false,
        };
      });
      return res.status(200).json(updatedPosts);
    }
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};
export const getProfilePosts = async (req, res) => {
  const { userId } = req.query;
  const temp = req.user._id.toString();
  try {
    if (temp === userId) {
      const userPosts = await Post.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "pic name" })
        .populate({
          path: "comments",
          populate: {
            path: "user",
            select: "pic name",
          },
        })
        .populate({
          path: "likes",
          populate: {
            path: "user",
            select: "pic name",
          },
        });
      const updatedPosts = userPosts.map((post) => {
        const liked = post.likes.some((like) => {
          return like.user._id.toString() === req.user._id.toString();
        });

        const likeId = post.likes.find((like) => {
          return like.user._id.toString() === req.user._id.toString();
        })?._id;

        return {
          ...post.toObject(),
          liked: liked ? { status: true, likeId } : false,
        };
      });
      return res.status(200).json(updatedPosts);
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.postsVisibility === "private") {
      return res.status(200).json([]);
    }

    let posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "pic name" })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "pic name",
        },
      })
      .populate({
        path: "likes",
        populate: {
          path: "user",
          select: "pic name",
        },
      });

    if (user.postsVisibility === "public") {
      return res.status(200).json(posts);
    }

    const friendIds = user.friends.map((friend) => friend.toString());
    const isFriend = friendIds.includes(temp);
    let updatedPosts = posts.map((post) => {
      const liked = post.likes.some((like) => {
        return like.user._id.toString() === req.user._id.toString();
      });

      const likeId = post.likes.find((like) => {
        return like.user._id.toString() === req.user._id.toString();
      })?._id;

      return {
        ...post.toObject(),
        liked: liked ? { status: true, likeId } : false,
      };
    });

    updatedPosts = updatedPosts.filter((post) => {
      if (post.visibility === "private") {
        return post.user.toString() === temp;
      } else if (post.visibility === "friends") {
        return isFriend;
      } else {
        return true;
      }
    });

    return res.status(200).json(updatedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const addPost = async (req, res) => {
  const { visibility, title, image } = req.body;
  try {
    let newPost = await Post.create({
      visibility,
      title,
      image,
      user: req.user._id,
    });

    let user = await User.findById(req.user._id);
    user.posts.push(newPost);
    await user.save();

    res.status(200).json(newPost);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.query;

  try {
    let deletedPost = await Post.findByIdAndDelete(postId);

    res.status(200).json(deletedPost);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const updatePostVisibility = async (req, res) => {
  const { postId, visibility } = req.body;
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { visibility },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const addComment = async (req, res) => {
  const { title, postId } = req.body;
  const user = req.user._id;
  try {
    const currentPost = await Post.findById(postId);
    const newComment = await Comment.create({
      title,
      user,
    });
    currentPost.comments.push(newComment);
    await currentPost.save();
    res.status(200).json({ meesage: "New comment added" });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};
export const addLike = async (req, res) => {
  const { postId } = req.body;
  const user = req.user._id;
  try {
    const currentPost = await Post.findById(postId);
    const newLike = await Like.create({
      user,
    });
    currentPost.likes.push(newLike);
    await currentPost.save();
    res.status(200).json({ meesage: "New like added" });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};
export const removeLike = async (req, res) => {
  const { likeId } = req.query;
  try {
    const deletedLike = await Like.findByIdAndDelete(likeId);
    res.status(200).json({ meesage: "Like deleted" });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};
