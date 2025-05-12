const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/userController");

router.get("/users/:userId", getUsers);

module.exports = router;
