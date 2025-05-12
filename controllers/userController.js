const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const usersList = await User.find({});
    if (!usersList) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
    const users = usersList.map((user) => {
      user.email = undefined;
      user.role = undefined;
      user.password = undefined;
      return user;
    });
    return res.status(200).json({
      success: true,
      message: "Fetched users!",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
