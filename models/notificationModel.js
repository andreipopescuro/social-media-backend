import mongoose from "mongoose";

const NotificationModel = mongoose.Schema(
  {
    title: {
      type: String,
    },
    type: {
      type: String,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    newNotif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationModel);

export default Notification;
