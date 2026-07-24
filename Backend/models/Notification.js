const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// + markAsRead(): marque la notification comme lue
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  await this.save();
  return this;
};

module.exports = mongoose.model("Notification", notificationSchema);