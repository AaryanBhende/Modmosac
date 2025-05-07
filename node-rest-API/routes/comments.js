const router = require("express").Router();
const Comment = require("../models/Comment");

// Create a comment
router.post("/", async (req, res) => {
  const newComment = new Comment(req.body);
  try {
    const savedComment = await newComment.save();
    //AI api
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId, parentId: null }); // Fetch only top-level comments
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Reply to a comment
router.post("/:commentId/reply", async (req, res) => {
  try {
    const newReply = new Comment({ ...req.body, parentId: req.params.commentId });
    const savedReply = await newReply.save();
    res.status(200).json(savedReply);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get replies for a comment
router.get("/replies/:commentId", async (req, res) => {
  try {
    const replies = await Comment.find({ parentId: req.params.commentId });
    res.status(200).json(replies);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router; 