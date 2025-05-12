const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then((conn) => {
      console.log(`Connected to database: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log("Database connection failed");
      console.log(err.message);
      process.exit(1);
    });
};

module.exports = connectDB;
