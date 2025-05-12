const PublicChatRoom = require("../models/PublicChatRoom");

exports.createPublicChatRoom = async (req, res) => {
  const { userId } = req.params;
  let { room } = req.body;
  users = [userId];
  const newPublicChatRoom = await PublicChatRoom.create({
    room,
    createdBy: userId,
    users,
  });
  try {
    return res.status(200).json({
      success: true,
      message: "Public room created!",
      newPublicChatRoom,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

exports.getPublicChatRoom = async (req, res) => {
  const { roomId, userId } = req.params;
  try {
    if (req.userId === userId) {
      const publicChatRoom = await PublicChatRoom.find({ _id: roomId });
      if (!publicChatRoom) {
        return res.status(400).json({
          success: false,
          message: "Public chat room not found.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Fetched Public chat room!",
        publicChatRoom,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to perform action.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

exports.getPublicChatRooms = async (req, res) => {
  const { userId } = req.params;
  try {
    if (req.userId === userId) {
      const rooms = await PublicChatRoom.find({});
      if (!rooms) {
        return res.status(400).json({
          success: false,
          message: "No public chat room found.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Fetched public chat rooms!",
        rooms,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

exports.updatePublicChatRoom = async (req, res) => {
  const { userId, roomId } = req.params;
  const { name, users } = req.body;
  try {
    if (req.userId === userId) {
      const room = await PublicChatRoom.findById(roomId);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Public chat room doesn't exist",
        });
      }
      const updatedRoomData = {};
      if (name) {
        updatedRoomData.name = name;
      }
      if (users.length > 0) {
        updatedRoomData.users = [...users];
      }
      const updatedRoom = await PublicChatRoom.findByIdAndUpdate(
        roomId,
        updatedRoomData,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Updated Public room!",
        updatedRoom,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to perform action.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

exports.deletePublicChatRoom = async (req, res) => {
  const { userId, roomId } = req.params;
  try {
    if (req.userId === userId) {
      const room = await PublicChatRoom.findById(roomId);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Public chat room doesn't exist",
        });
      }
      const deletedRoom = await PublicChatRoom.findByIdAndDelete(roomId);
      return res.status(200).json({
        success: true,
        message: "Deleted Public chat room!",
        deletedRoom,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to perform action.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
