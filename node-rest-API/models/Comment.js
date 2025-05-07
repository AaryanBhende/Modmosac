const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    parentId: {
      type: String, // To store the ID of the parent comment if it's a reply
      default: null,
    },
    replies: [{
      userId: String,
      text: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema); 