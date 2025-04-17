// server.js
const connectDB = require("./config/db");
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

//chat feature
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origin if known
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  // Listen for messages
  socket.on("send_message", async (data) => {
    const { sender, receiver, content } = data;

    // Save message to DB
    const Message = require('./models/Message');
    const newMsg = new Message({ sender, receiver, content });
    await newMsg.save();

    // Emit to receiver (or broadcast to all for now)
    io.emit("receive_message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});


// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes); // All user-related routes prefixed with /api/users

// DB + Server
connectDB()
    .then(() => {
        console.log("Database connection established...");
        server.listen(2222, () => {
            console.log("Server is successfully listening on port 2222...");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected!!");
    });