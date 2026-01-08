// routes/jobs.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");

/**
 * Public Job Search
 * Query params:
 *  - q        (keyword, searches title/description/qualifications/responsibilities)
 *  - jobType  ("internship" | "job" or omitted meaning all)
 *  - location (partial text match)
 *  - limit, page (optional)
 */
router.get("/", async (req, res) => {
  try {
    const { q, jobType, location, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (jobType && jobType !== "all") {
      filter.jobType = jobType;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (q) {
      // search multiple fields
      const regex = { $regex: q, $options: "i" };
      filter.$or = [
        { title: regex },
        { description: regex },
        { qualifications: regex },
        { responsibilities: regex }
      ];
    }

    const skip = (Math.max(parseInt(page,10),1) - 1) * parseInt(limit,10);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({ jobs });
  } catch (err) {
    console.error("Jobs search error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create Job (employer only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") return res.status(403).json({ msg: "Only employers can create jobs" });

    const job = new Job({
      employerId: req.user.id,
      employerName: req.user.username,
      jobType: req.body.jobType, // should be "internship" or "job"
      title: req.body.title,
      description: req.body.description,
      qualifications: req.body.qualifications,
      responsibilities: req.body.responsibilities,
      location: req.body.location,
      salary: req.body.salary,
      createdAt: new Date()
    });

    await job.save();
    res.json({ msg: "Job created", job });
  } catch (err) {
    console.error("Job create error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get jobs created by logged-in employer
router.get("/my-jobs", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    console.error("My jobs error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete job (employer only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employerId: req.user.id });
    if (!job) return res.status(404).json({ msg: "Job not found or unauthorized" });
    res.json({ msg: "Job deleted" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Edit job (employer only)
router.put("/:id", auth, async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      jobType: req.body.jobType,
      description: req.body.description,
      qualifications: req.body.qualifications,
      responsibilities: req.body.responsibilities,
      location: req.body.location,
      salary: req.body.salary,
      updatedAt: new Date()
    };

    const job = await Job.findOneAndUpdate({ _id: req.params.id, employerId: req.user.id }, update, { new: true });
    if (!job) return res.status(404).json({ msg: "Job not found or unauthorized" });

    res.json({ msg: "Job updated", job });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// in routes/jobs.js (near top)
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Not found" });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
