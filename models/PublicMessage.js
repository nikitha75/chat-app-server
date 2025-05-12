const mongoose = require("mongoose");

const publicMessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: String,
  },
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PublicMessage", publicMessageSchema);
