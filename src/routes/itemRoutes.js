
const router = require("express").Router();
const mongoose = require("mongoose");
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");

// Search and get all items
router.get("/", async (req, res) => {
  try {
    const { q, category, location, type, sort = "newest" } = req.query;

    const filter = { status: { $ne: "closed" } };

    if (q) {
      const search = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: search }, { description: search }];
    }

    if (category) filter.category = category;
    if (location) filter.location = new RegExp(escapeRegex(location), "i");
    if (type) filter.type = type;

    const sortOrder = sort === "oldest" ? 1 : -1;

    const items = await Item.find(filter)
      .populate("postedBy", "name")
      .sort({ itemDate: sortOrder })
      .limit(100);

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
});

// Get items posted by logged-in student
// IMPORTANT: This route must come before /:id
router.get("/my", protect, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your items", error: error.message });
  }
});

// Get one item by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id)
      .populate("postedBy", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
});

// Create an item
router.post("/", protect, async (req, res) => {
  try {
    const { title, category, description, location, itemDate, type, imageUrl } = req.body;

    if (!title || !category || !description || !location || !itemDate ||
      !["lost", "found"].includes(type)) {
      return res.status(400).json({
        message: "Please provide all required item details"
      });
    }

    const item = await Item.create({
      title,
      category,
      description,
      location,
      itemDate,
      type,
      imageUrl: imageUrl || "",
      postedBy: req.user._id
    });

    res.status(201).json({ message: "Item report created", item });
  } catch (error) {
    res.status(500).json({ message: "Failed to create item", error: error.message });
  }
});

// Update an item
router.patch("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (String(item.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can update only your own listing"
      });
    }

    const allowed = [
      "title", "category", "description", "location",
      "itemDate", "type", "imageUrl", "status"
    ];

    allowed.forEach(key => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    await item.save();

    res.json({ message: "Item updated", item });
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
});

// Delete an item
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (String(item.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can delete only your own listing"
      });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
