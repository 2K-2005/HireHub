const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  companyName: String,
  email: String,
  phone: String,
  location: String,
  industry: String,
  size: String,
  website: String,
  description: String,
  requirements: String,
  aboutHR: String,
  linkedin: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("Employer", EmployerSchema);
