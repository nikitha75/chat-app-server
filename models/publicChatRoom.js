const mongoose = require("mongoose");

const publicChatRoomSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  users: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PublicChatRoom", publicChatRoomSchema);
