const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  sender: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PrivateMessage", privateMessageSchema);
