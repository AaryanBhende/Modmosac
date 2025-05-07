const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

// Combined search endpoint
router.get("/", async (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    let users = [];
    let posts = [];

    // Handle different types of searches
    if (searchQuery.startsWith("@")) {
      // Username search
      const username = searchQuery.substring(1);
      users = await User.find({
        username: { $regex: username, $options: "i" }
      })
        .select("username profilePicture")
        .limit(5);
    } else if (searchQuery.startsWith("#")) {
      // Hashtag search
      const hashtag = searchQuery.substring(1);
      posts = await Post.find({
        tags: { $in: [new RegExp(hashtag, "i")] }
      })
        .populate("userId", "username profilePicture")
        .sort({ createdAt: -1 })
        .limit(5);
    } else {
      // General search
      // Search for users
      users = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } }
        ]
      })
        .select("username profilePicture")
        .limit(5);

      // Search for posts
      posts = await Post.find({
        $or: [
          { desc: { $regex: searchQuery, $options: "i" } },
          { tags: { $in: [new RegExp(searchQuery, "i")] } },
          { location: { $regex: searchQuery, $options: "i" } }
        ]
      })
        .populate("userId", "username profilePicture")
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({
      users,
      posts
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Error performing search", error: err.message });
  }
});

// Get search results for a specific type
router.get("/:type/:query", async (req, res) => {
  const { type, query } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let results = [];

    switch (type) {
      case "text":
        results = await Post.find({
          $or: [
            { desc: { $regex: query, $options: "i" } },
            { tags: { $in: [new RegExp(query, "i")] } },
            { location: { $regex: query, $options: "i" } }
          ]
        })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        break;

      case "tag":
        results = await Post.find({
          tags: { $in: [new RegExp(query, "i")] }
        })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        break;

      case "user":
        results = await User.find({
          username: { $regex: query, $options: "i" }
        })
          .select("username profilePicture")
          .skip(skip)
          .limit(limit);
        break;

      default:
        return res.status(400).json({ message: "Invalid search type" });
    }

    const total = await Post.countDocuments({
      $or: [
        { desc: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
        { location: { $regex: query, $options: "i" } }
      ]
    });

    res.json({
      results,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Error performing search", error: err.message });
  }
});

module.exports = router; 