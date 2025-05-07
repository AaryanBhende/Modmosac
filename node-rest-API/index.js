const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");
const searchRoute = require("./routes/search");
const multer = require("multer");
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const commentsRoute = require("./routes/comments");

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
app.use("/api/comments", commentsRoute);
app.use("/api/search", searchRoute);

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");

  // When user connects
  socket.on("addUser", (userId) => {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }
  });

  // When user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    for (let [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});


// Change app.listen to server.listen
server.listen(8800, () => {
  console.log("Backend server is running!");
});
