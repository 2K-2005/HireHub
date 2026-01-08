const express = require("express");
const router = express.Router();
const Employer = require("../models/Employer");
const auth = require("../middleware/auth");

// CREATE or UPDATE employer profile
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer")
      return res.status(403).json({ message: "Access denied" });

    const body = req.body;

    const payload = {
      userId: req.user.id,
      companyName: body.companyName,
      email: req.user.username,
      phone: body.phone,
      location: body.location,
      industry: body.industry,
      size: body.size,
      website: body.website,
      description: body.description,
      requirements: body.requirements,
      aboutHR: body.aboutHR,
      linkedin: body.linkedin,
      updatedAt: new Date()
    };

    const employer = await Employer.findOneAndUpdate(
      { userId: req.user.id },
      { $set: payload, $setOnInsert: { createdAt: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ message: "Employer profile saved", employer });
  } catch (err) {
    console.error("Employer save error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET logged-in employer
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer")
      return res.status(403).json({ message: "Access denied" });

    const employer = await Employer.findOne({ userId: req.user.id });
    if (!employer) return res.status(404).json({ message: "No profile found" });

    res.json({ employer });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
