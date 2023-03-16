import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import generateToken from "../config/generateToken.js";
import FriendRequest from "../models/friendRequestModel.js";
import Post from "../models/postModel.js";
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("posts");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json("Invalid Email or Password");
    }
  } catch (error) {
    res.status(401).json("Invalid Email or Password");
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json("Complete all fields.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json("User exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json("Error creating your account");
  }
};

export const getUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [{ name: { $regex: req.query.search, $options: "i" } }],
      }
    : {};
  try {
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("name pic friends");
    const updatedUsers = users.map((user) => {
      const isFriend = user.friends.some(
        (friend) => friend._id.toString() === req.user._id.toString()
      );
      return { ...user.toObject(), isFriend };
    });
    res.status(200).json(updatedUsers);
  } catch (error) {
    console.log(error);

    res.status(500).json("Something went wrong");
  }
};

export const changeUserSettings = async (req, res) => {
  const { visibility, postsVisibility } = req.body;
  try {
    const updatedUserSettings = await User.findByIdAndUpdate(
      req.user._id,
      {
        visibility,
        postsVisibility,
      },
      { new: true }
    ).select("postsVisibility visibility");
    if (postsVisibility !== "custom") {
      const updatedPosts = await Post.updateMany(
        {
          user: req.user._id,
        },
        {
          visibility: postsVisibility,
        }
      );
    }

    res.status(200).json({ message: "Update successfully" });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};
export const changeUserInfo = async (req, res) => {
  const { city, country, occupation } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        city,
        country,
        occupation,
      },
      { new: true }
    ).select("city country occupation _id ");

    res.status(200).json({ message: "User info changed" });
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};

export const getUserAbout = async (req, res) => {
  const { userId } = req.query;
  try {
    const userInfo = await User.findById(userId)
      .populate({
        path: "friends",
        select: "pic",
      })
      .select("city country occupation friends visibility");
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};

export const getUserInfo = async (req, res) => {
  const { userId } = req.query;
  try {
    const userInfo = await User.findById(userId)
      .populate("posts")
      .populate({
        path: "friends",
        select: "pic name",
      })
      .populate("friendRequests")
      .select("name posts pic friends friendRequests visibility");
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};
export const getFriends = async (req, res) => {
  try {
    const friends = await User.findById(req.user._id)
      .populate({
        path: "friends",
        select: "name pic occupation",
      })
      .select("friends");
    res.status(200).json(friends);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};
export const getUserSettings = async (req, res) => {
  try {
    const settings = await User.findById(req.user._id).select(
      "postsVisibility visibility"
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const getUserPosts = async (req, res) => {
  try {
    let userPosts = await User.findOne({ _id: req.user._id })
      .populate("posts")
      .select("posts");
    res.status(200).json(userPosts);
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const changeProfilePic = async (req, res) => {
  try {
    const updatedProfilePic = await User.findByIdAndUpdate(
      req.user._id,
      {
        pic: req.body.image,
      },
      { new: true }
    ).select("name pic");
    res.status(200).json(updatedProfilePic);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

export const addFriendRequest = async (req, res) => {
  const { userId } = req.body;
  try {
    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      reciver: userId,
    });
    const userToAddRequest = await User.findById(userId);
    userToAddRequest.friendRequests.push(friendRequest);
    await userToAddRequest.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

export const deleteFriendReqeust = async (req, res) => {
  try {
    const deletedFriendRequest = await FriendRequest.deleteOne({
      sender: req.user._id,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  try {
    const newFriend = await User.findById(senderId);
    const deletedRequest = await FriendRequest.deleteOne({ sender: senderId });
    const newNotification = await Notification.create({
      type: "accept",
      sender: req.user._id,
      receiver: senderId,
      title: "Accepted your friend request",
    });
    const currentUser = await User.findById(req.user._id);
    newFriend.notifications.push(newNotification);
    newFriend.friends.push(currentUser);
    currentUser.friends.push(newFriend);

    await newFriend.save();
    await currentUser.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

export const rejectFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  try {
    const newFriend = await User.findById(senderId);
    const deletedRequest = await FriendRequest.deleteOne({ sender: senderId });
    const newNotification = await Notification.create({
      type: "reject",
      sender: req.user._id,
      receiver: senderId,
      title: "Rejected your friend request",
    });
    newFriend.notifications.push(newNotification);
    await newFriend.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    let userFriendRequests = await User.findOne({ _id: req.user._id })
      .populate({
        path: "friendRequests",
        populate: { path: "sender", select: "name pic" },
      })
      .select("friendRequests")
      .lean();

    userFriendRequests.friendRequests.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const newFriendRequestsCount = userFriendRequests.friendRequests.filter(
      (friendRequest) => friendRequest.newReq
    ).length;
    res.status(200).json({
      friendRequests: userFriendRequests.friendRequests,
      newFriendRequestsCount,
    });
  } catch (error) {
    res.status(200).json("Something went wrong");
  }
};

export const updateFriendRequests = async (req, res) => {
  try {
    const updatedFriendRequests = await FriendRequest.updateMany(
      {
        reciver: req.user._id,
      },
      { newReq: false }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};

export const deleteFriend = async (req, res) => {
  const { theOtherUser } = req.query;
  try {
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(theOtherUser);
    currentUser.friends.pull(theOtherUser);
    otherUser.friends.pull(req.user);
    await currentUser.save();
    await otherUser.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};

export const getNotifications = async (req, res) => {
  try {
    let userNotifications = await User.findOne({ _id: req.user._id })
      .populate({
        path: "notifications",
        populate: { path: "sender", select: "name pic" },
      })
      .select("notifications")
      .lean();

    userNotifications.notifications.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const newNotificationsCount = userNotifications.notifications.filter(
      (notification) => notification.newNotif
    ).length;

    res.status(200).json({
      notifications: userNotifications.notifications,
      newNotificationsCount,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};

export const updateViewedNotifications = async (req, res) => {
  try {
    const updateNotificationCount = await Notification.updateMany(
      {
        receiver: req.user._id,
      },
      { newNotif: false }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};

export const recommedFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const friendsIds = user.friends.map((friend) => friend.toString());

    const recommendedFriends = await User.find({
      _id: { $ne: user._id, $nin: friendsIds },
    })
      .select("name pic")
      .limit(10);

    res.status(200).json(recommendedFriends);
  } catch (error) {
    console.log(error);
    res.status(200).json("Something went wrong");
  }
};
