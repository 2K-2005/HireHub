// routes/applications.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

// 1) Fresher applies to a job
// POST /api/applications/apply
router.post("/apply", auth, async (req, res) => {
  try {
    if (req.user.role !== "fresher") return res.status(403).json({ msg: "Only freshers can apply" });

    const { jobId, resumeLink, coverLetter } = req.body;
    if (!jobId) return res.status(400).json({ msg: "Job ID required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Prevent double apply (optional)
    const existing = await Application.findOne({ jobId, fresherId: req.user.id });
    if (existing) return res.status(400).json({ msg: "You already applied to this job" });

    const fresher = await User.findById(req.user.id);

    const app = new Application({
      jobId,
      jobTitle: job.title,
      employerId: job.employerId,
      fresherId: req.user.id,
      fresherName: fresher.username || fresher.username,
      fresherEmail: fresher.username, // we used username as email earlier
      resumeLink: resumeLink || "",
      coverLetter: coverLetter || ""
    });

    await app.save();
    res.json({ msg: "Application submitted", application: app });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 2) Fresher: list my applications
// GET /api/applications/my-applications
router.get("/my-applications", auth, async (req, res) => {
  try {
    if (req.user.role !== "fresher") return res.status(403).json({ msg: "Only freshers" });
    const apps = await Application.find({ fresherId: req.user.id }).sort({ createdAt: -1 });
    res.json({ apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 3) Employer: list applications for a job (or all jobs of employer)
// GET /api/applications/job/:jobId
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") return res.status(403).json({ msg: "Only employers" });

    const jobId = req.params.jobId;
    const job = await Job.findOne({ _id: jobId, employerId: req.user.id });
    if (!job) return res.status(404).json({ msg: "Job not found or not yours" });

    const apps = await Application.find({ jobId }).sort({ createdAt: -1 });
    res.json({ apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 4) Employer: list applications for ALL my jobs
// GET /api/applications/my-jobs-applications
router.get("/employer/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") return res.status(403).json({ msg: "Only employers" });
    const apps = await Application.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 5) Employer: update application status (shortlist/reject/hire)
// PUT /api/applications/:id/status
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") return res.status(403).json({ msg: "Only employers" });

    const id = req.params.id;
    const { status } = req.body;
    if (!["applied","shortlisted","rejected","hired"].includes(status)) return res.status(400).json({ msg: "Invalid status" });

    // ensure application belongs to one of this employer's jobs
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ msg: "Application not found" });
    if (String(app.employerId) !== String(req.user.id)) return res.status(403).json({ msg: "Not authorized" });

    app.status = status;
    app.updatedAt = new Date();
    await app.save();

    res.json({ msg: "Status updated", application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 6) Fresher: withdraw application
// DELETE /api/applications/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    // both fresher (withdraw) and employer (maybe remove) could delete — enforce ownership
    const id = req.params.id;
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ msg: "Not found" });

    if (req.user.role === "fresher" && String(app.fresherId) !== String(req.user.id))
      return res.status(403).json({ msg: "Not authorized" });

    if (req.user.role === "employer" && String(app.employerId) !== String(req.user.id))
      return res.status(403).json({ msg: "Not authorized" });

    await app.deleteOne();
    res.json({ msg: "Application removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
