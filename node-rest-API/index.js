const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");
const multer = require("multer");
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

dotenv.config();


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
  });

  
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));  

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);

// Keep track of online users
let onlineUsers = [];

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");
  
  // Add user to online users
  socket.on("addUser", (userId) => {
    const userExists = onlineUsers.some(user => user.userId === userId);
    if (!userExists) {
      onlineUsers.push({
        userId: userId,
        socketId: socket.id,
      });
    }
    io.emit("getOnlineUsers", onlineUsers.map(user => user.userId));
  });

  // Remove user when they disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers.map(user => user.userId));
    console.log("A user disconnected");
  });
});

// Change app.listen to server.listen
server.listen(8800, () => {
  console.log("Backend server is running!");
});
