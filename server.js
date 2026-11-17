require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/authRoutes");
const itemRoutes = require("./src/routes/itemRoutes");
const claimRoutes = require("./src/routes/claimRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Campus Lost and Found API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
