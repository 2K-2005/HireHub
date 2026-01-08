require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const mongoUri = process.env.MONGO_URI;
console.log("Using MONGO_URI:", mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// routes
app.use("/auth", require("./routes/auth"));
app.use("/api/freshers", require("./routes/freshers"));
app.use("/api/employers", require("./routes/employers"));
app.use("/api/jobs", require("./routes/jobs"));
const applicationRoutes = require("./routes/applications");
app.use("/api/applications", applicationRoutes);



// serve landing on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
