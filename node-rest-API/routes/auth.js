const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");


// Create new user
router.post("/register", async (req, res) => {
  try {
    // Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: err.message });
  }
});


//LOGIN
   router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json("User not found");
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(400).json("Invalid password");
      }

      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  //Logout
  router.post("/logout", async (req, res) => {
    try {
      // If using sessions
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("sessionId"); // Clear session cookie
        return res.status(200).json({ message: "Logged out successfully" });
      });
  
      // If using JWT
      // res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;