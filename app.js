require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const publicChatRoomRoutes = require("./routes/publicChatRoomRoutes");
const userRoutes = require("./routes/userRoutes");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const PublicMessage = require("./models/PublicMessage");
const PrivateMessage = require("./models/PrivateMessage");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api", publicChatRoomRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

const server = createServer(app);
const BASE_URL = process.env.BASE_URL;

const io = new Server(server, {
  cors: {
    origin: BASE_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware: verify JWT on connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.join(decoded.userId); // Join a private room with their userId
    next();
  } catch (err) {
    console.error("JWT verification failed", err);
    return next(new Error("Authentication failed"));
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log("User connected:", userId);

  onlineUsers.set(userId, socket.id);

  // Notify all clients this user is online
  io.emit("user_online", userId);

  // Public chat events
  // Join a public room
  socket.on("join_room", async (room) => {
    socket.join(room);
    const messages = await PublicMessage.find({ room })
      .sort({ timestamp: -1 })
      .limit(50); // latest 50 messages
    socket.emit("chat_history", messages.reverse()); // reverse for oldest to newest
  });

  // Send a message to a public room
  socket.on("public_message", async ({ room, message }) => {
    const sender = await User.findById(userId).select("username");
    const saved = await PublicMessage.create({
      room,
      senderId: userId,
      sender: sender ? sender.username : "Unknown user",
      message,
    });
    io.to(room).emit("public_message", saved);
  });

  // Delete a public message
  socket.on("delete_public_message", async ({ messageId }) => {
    await PublicMessage.findByIdAndDelete(messageId);
    io.emit("public_message_deleted", messageId);
  });

  // Edit a public message
  socket.on("edit_public_message", async ({ messageId, newContent }) => {
    const updated = await PublicMessage.findByIdAndUpdate(
      messageId,
      { message: newContent },
      { new: true }
    );
    io.emit("public_message_edited", updated);
  });

  // Private chat events
  socket.on("join_private", async ({ toUserId }) => {
    const privateRoom = [userId, toUserId].sort().join("_");
    socket.join(privateRoom);

    const history = await PrivateMessage.find({
      participants: { $all: [userId, toUserId] },
    }).sort({ timestamp: 1 });

    socket.emit("private_history", history);
  });

  socket.on("private_message", async ({ toUserId, message }) => {
    const privateRoom = [userId, toUserId].sort().join("_");

    const sender = await User.findById(userId).select("username");

    const msg = await PrivateMessage.create({
      participants: [userId, toUserId],
      senderId: userId,
      sender: sender?.username || "Unknown",
      message,
    });

    io.to(privateRoom).emit("private_message", msg);
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
});

module.exports = app;
