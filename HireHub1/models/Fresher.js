const mongoose = require("mongoose");

const FresherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  name: String,
  email: String,
  phone: String,
  headline: String,
  location: String,
  skills: [String],
  education: String,
  projects: String,
  github: String,
  linkedin: String,
  resumeLink: String,
  about: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("Fresher", FresherSchema);
