const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../controllers/authController");
const {
  createPublicChatRoom,
  getPublicChatRoom,
  getPublicChatRooms,
  updatePublicChatRoom,
  deletePublicChatRoom,
} = require("../controllers/publicChatRoomController");

router.post("/room/:userId", isAuthenticated, createPublicChatRoom);
router.get("/room/:roomId/:userId", isAuthenticated, getPublicChatRoom);
router.get("/rooms/:userId", isAuthenticated, getPublicChatRooms);
router.put("/room/:roomId/:userId", isAuthenticated, updatePublicChatRoom);
router.delete("/room/:roomId/:userId", isAuthenticated, deletePublicChatRoom);

module.exports = router;
