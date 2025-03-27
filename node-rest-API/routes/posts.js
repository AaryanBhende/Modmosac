const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// Create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: "Failed to create post", details: err });
    }
});

// Update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("The post has been updated");
        } else {
            res.status(403).json("You can update only your post");
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to update post", details: err });
    }
});

// Delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        } else {
            res.status(403).json("You can delete only your post");
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete post", details: err });
    }
});

// Like or dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to like/dislike post", details: err });
    }
});

// Get all a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve post", details: err });
    }
});

// Get all posts (Global Feed)
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch global posts", details: err });
    }
});

//get all of user's posts
router.get("/profile/:username", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      const posts = await Post.find({ userId: user._id });
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// Get timeline posts
// router.get("/timeline/all", async (req, res) => {
//     try {
//         // Check if userId is provided in the request body
//         if (!req.body.userId) {
//             return res.status(400).json({ error: "User ID is required" });
//         }

//         const currentUser = await User.findById(req.body.userId);
//         if (!currentUser) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         const userPosts = await Post.find({ userId: currentUser._id });
//         const friendPosts = await Promise.all(
//             currentUser.followings.map(async (friendId) => {
//                 try {
//                     return await Post.find({ userId: friendId });
//                 } catch (err) {
//                     console.error(`Error fetching posts for friendId: ${friendId}`, err);
//                     return [];
//                 }
//             })
//         );

//         res.status(200).json(userPosts.concat(...friendPosts));
//     } catch (err) {
//         res.status(500).json({ error: "Failed to get timeline posts", details: err });
//     }
// });


router.get("/timeline/:userId", async (req, res) => {
    try {
      const currentUser = await User.findById(req.params.userId);
      const userPosts = await Post.find({ userId: currentUser._id });
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Post.find({ userId: friendId });
        })
      );
      res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
module.exports = router;

