import Notification from "../models/notificationModel.js";

// those functions are useless

export const addNotification = async (req, res) => {
  const { title, type, user } = req.body;
  try {
    const newNotification = await Notification.create({
      title,
      type,
      user,
    });
    res.status(200).json(newNotification);
  } catch (error) {
    res.status(401).json("Something went wrong");
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("user");
    res.status(200).json(notifications);
  } catch (error) {
    res.status(401).json("Something went wrong");
  }
};
