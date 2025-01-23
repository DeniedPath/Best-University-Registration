// controllers/userController.js
const User = require("../models/user");
class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
  // Create new user
  async createUser(req, res) {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json({
        status: "success",
        data: newUser,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}
module.exports = new UserController();
