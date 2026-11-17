const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ message: "Name, valid email and password (minimum 8 characters) are required" });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(409).json({ message: "Email is already registered" });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ message: "Registration successful", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: "Could not register user" }); }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));
module.exports = router;
