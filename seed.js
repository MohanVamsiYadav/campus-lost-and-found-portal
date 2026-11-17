
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");
const Item = require("./src/models/Item");

const samples = [
  ["Black wallet", "Accessories", "Black leather wallet with student ID inside", "Library", "2026-11-10", "lost"],
  ["Blue water bottle", "Accessories", "Blue steel bottle with a sticker", "Cafeteria", "2026-11-11", "found"],
  ["Scientific calculator", "Electronics", "Casio calculator, black colour", "Block A - Room 204", "2026-11-09", "lost"],
  ["USB drive", "Electronics", "32GB silver USB drive", "Computer Lab 2", "2026-11-12", "found"],
  ["Student ID card", "Documents", "ID card belonging to a first-year student", "Main Gate", "2026-11-12", "found"],
  ["Wireless earbuds case", "Electronics", "White charging case, earbuds may be inside", "Auditorium", "2026-11-08", "lost"],
  ["Notebook", "Books", "Green notebook with Data Structures notes", "Block B", "2026-11-07", "found"],
  ["House keys", "Accessories", "Two keys with a small red keychain", "Sports Complex", "2026-11-13", "lost"],
  ["Lunch box", "Other", "Grey lunch box", "Cafeteria", "2026-11-13", "found"],
  ["Black umbrella", "Other", "Foldable black umbrella", "Parking Area", "2026-11-06", "lost"]
];

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is missing in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected to MongoDB");

  // Create or update admin
  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@campus.edu"
  ).toLowerCase();

  const adminPasswordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    12
  );

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    await User.create({
      name: process.env.ADMIN_NAME || "Campus Admin",
      email: adminEmail,
      password: adminPasswordHash,
      role: "admin"
    });

    console.log("Admin account created successfully");
  } else {
    admin.name = process.env.ADMIN_NAME || "Campus Admin";
    admin.password = adminPasswordHash;
    admin.role = "admin";

    await admin.save();

    console.log("Existing admin password updated successfully");
  }

  // Create demo student if missing
  let demo = await User.findOne({
    email: "student@campus.edu"
  });

  if (!demo) {
    await User.create({
      name: "Demo Student",
      email: "student@campus.edu",
      password: await bcrypt.hash("Student123!", 12)
    });

    console.log("Demo student created successfully");
  } else {
    console.log("Demo student already exists");
  }

  // Insert sample items if collection is empty
  const itemCount = await Item.countDocuments();

  if (itemCount === 0) {
    await Item.insertMany(
      samples.map((s) => ({
        title: s[0],
        category: s[1],
        description: s[2],
        location: s[3],
        itemDate: new Date(s[4]),
        type: s[5],
        postedBy: demo._id
      }))
    );

    console.log("10 sample items inserted successfully");
  } else {
    console.log("Sample items already exist. No duplicates added.");
  }

  console.log("Database seeding completed successfully");
  console.log("Admin email:", adminEmail);
  console.log("Demo student: student@campus.edu / Student123!");
}

seedDatabase()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
