const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  employerId: String,
  employerName: String,
  jobType: { type: String, enum: ["internship","job"], required: true },
  title: { type: String, required: true },
  description: String,
  qualifications: String,
  responsibilities: String,
  location: String,
  salary: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
