// models/Application.js
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  jobTitle: { type: String },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fresherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fresherName: { type: String },
  fresherEmail: { type: String },
  resumeLink: { type: String },   // URL to resume
  coverLetter: { type: String },
  status: { type: String, enum: ["applied","shortlisted","rejected","hired"], default: "applied" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model("Application", ApplicationSchema);
