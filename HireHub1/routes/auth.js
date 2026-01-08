const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ msg: "All fields required" });
    if (!["fresher", "employer"].includes(role)) return res.status(400).json({ msg: "Invalid role" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    await user.save();
    res.json({ msg: "User Registered Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: "All fields required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid Username or Password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Invalid Username or Password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ msg: "Login successful", token, role: user.role, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get current user
const auth = require("../middleware/auth");
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
