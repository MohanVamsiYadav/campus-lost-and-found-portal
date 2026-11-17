
const router = require("express").Router();
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");

// Submit a claim
router.post("/", protect, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({
        message: "Item ID and claim message are required"
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    if (String(item.postedBy) === String(req.user._id)) {
      return res.status(400).json({
        message: "You cannot claim your own listing"
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message
    });

    return res.status(201).json({
      message: "Claim submitted",
      claim
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted a claim for this item"
      });
    }

    return res.status(500).json({
      message: "Failed to submit claim"
    });
  }
});

// Get my claims - supports both /my and /mine
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user._id
    })
      .populate("item")
      .sort({ createdAt: -1 });

    return res.status(200).json({ claims });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch claims"
    });
  }
};

router.get("/my", protect, getMyClaims);
router.get("/mine", protect, getMyClaims);

// Get claims received on my listings
router.get("/received", protect, async (req, res) => {
  try {
    const myItems = await Item.find({
      postedBy: req.user._id
    }).select("_id");

    const claims = await Claim.find({
      item: { $in: myItems.map(item => item._id) }
    })
      .populate("item")
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ claims });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch received claims"
    });
  }
});

module.exports = router;
