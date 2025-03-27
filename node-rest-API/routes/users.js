const router = require("express").Router();
const User = require("../models/User"); // Adjust the path as necessary
const bcrypt = require("bcrypt"); // Add this line to import bcrypt
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post"); // Adjust the path as necessary

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

const upload = multer({ storage: storage });

//update a user
router.put("/:id", upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPicture', maxCount: 1 }
]), async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
              console.log("Starting password encryption");
              const salt = await bcrypt.genSalt(10);
              req.body.password = await bcrypt.hash(req.body.password, salt);
              console.log("Password encrypted successfully");
            } catch (err) {
              console.error("Error encrypting password:", err);
              return res.status(500).json(err);
            }
          }
          
      try {
        const updateData = { ...req.body };
        
        // Handle file uploads if present
        if (req.files) {
          if (req.files.profilePicture) {
            updateData.profilePicture = req.files.profilePicture[0].filename;
          }
          if (req.files.coverPicture) {
            updateData.coverPicture = req.files.coverPicture[0].filename;
          }
        }

        const user = await User.findByIdAndUpdate(
          req.params.id,
          { $set: updateData },
          { new: true }
        );
        res.status(200).json(user);
      } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can update only your account!");
    }
  });

//delete a user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can delete only your account!");
    }
  });

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a user
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId)=> {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const {_id, username, profilePicture } =friend;
      friendList.push({_id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});
  
//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollowa user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

// Add this route to check username availability
router.get("/check-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({ available: !user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add bookmark
router.post("/:userId/bookmarks/:postId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user.bookmarks.includes(req.params.postId)) {
      await user.updateOne({ $push: { bookmarks: req.params.postId } });
      res.status(200).json("Post has been bookmarked");
    } else {
      res.status(403).json("Post is already bookmarked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Remove bookmark
router.delete("/:userId/bookmarks/:postId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    await user.updateOne({ $pull: { bookmarks: req.params.postId } });
    res.status(200).json("Post has been unbookmarked");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get bookmarked posts
router.get("/:userId/bookmarks", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const bookmarkedPosts = await Post.find({
      _id: { $in: user.bookmarks }
    });
    res.status(200).json(bookmarkedPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Check if post is bookmarked
router.get("/:userId/bookmarks/:postId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const isBookmarked = user.bookmarks.includes(req.params.postId);
    res.status(200).json({ isBookmarked });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
