
const router = require("express").Router();
const mongoose = require("mongoose");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

// Admin dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [items, lost, found, pendingClaims, returned] =
      await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ type: "lost" }),
        Item.countDocuments({ type: "found" }),
        Claim.countDocuments({ status: "pending" }),
        Item.countDocuments({ status: "returned" })
      ]);

    res.json({ items, lost, found, pendingClaims, returned });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Get all claims
router.get("/claims", async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("item")
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});

// Approve or reject a claim
router.patch("/claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected"
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    claim.status = status;
    await claim.save();

    if (status === "approved") {
      await Item.findByIdAndUpdate(claim.item, { status: "claimed" });
    }

    res.json({ message: `Claim ${status}`, claim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update claim" });
  }
});

// Get all items
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// Update item status
router.patch("/items/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    if (!["open", "claimed", "returned", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid item status" });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item status updated", item });
  } catch (error) {
    console.error("Admin item update error:", error);
    res.status(500).json({ message: "Failed to update item status" });
  }
});

module.exports = router;
