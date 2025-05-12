const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//middleware
exports.isAuthenticated = async (req, res, next) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    return res.status(401).send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, process.env.JWT_SECRET, (error, payload) => {
      if (error) {
        return res.status(401).send("Invalid JWT Token");
      } else {
        req.userId = payload.userId;
        req.role = payload.role;
        next();
      }
    });
  }
};

const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "4d" }
  );
};

exports.signup = async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const isAccountExist = await User.findOne({ email });
    if (isAccountExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    const userDetails = await newUser.save();
    const jwtToken = generateToken({
      userId: userDetails._id,
      role: userDetails.role,
    });
    return res.status(200).json({
      success: true,
      message: "Registration successful!",
      username: userDetails.username,
      email: userDetails.email,
      userId: userDetails._id,
      role: userDetails.role,
      jwtToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Email/Password is incorrect",
      });
    }
    if (user && isPasswordMatch) {
      const jwtToken = generateToken({
        userId: user._id,
        role: user.role,
      });
      user.jwtToken = jwtToken;
      user.password = undefined;
      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user,
        jwtToken,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error || "Something went wrong",
    });
  }
};
