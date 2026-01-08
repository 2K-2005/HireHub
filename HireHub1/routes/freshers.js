const express = require("express");
const router = express.Router();
const Fresher = require("../models/Fresher");
const auth = require("../middleware/auth");  // ✅ FIXED — correct import

// CREATE or UPDATE fresher profile
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "fresher") {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = req.body;

    // convert skills
    const skills = data.skills
      ? data.skills.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      userId: req.user.id,
      name: data.name,
      email: req.user.username,   // auto from login user
      phone: data.phone,
      location: data.location,
      headline: data.headline,
      skills,
      education: data.education || "",
      projects: data.projects || "",
      github: data.github,
      linkedin: data.linkedin,
      resumeLink: data.resumeLink,
      about: data.about,
      updatedAt: new Date()
    };

    const fresher = await Fresher.findOneAndUpdate(
      { userId: req.user.id },
      { $set: payload, $setOnInsert: { createdAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ message: "Profile saved", fresher });

  } catch (err) {
    console.error("Fresher save error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get logged-in fresher profile
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "fresher")
      return res.status(403).json({ message: "Access denied" });

    const fresher = await Fresher.findOne({ userId: req.user.id });
    if (!fresher) return res.status(404).json({ message: "No profile found" });

    res.json({ fresher });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
