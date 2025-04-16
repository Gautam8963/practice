// server.js
const connectDB = require("./config/db");
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

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
        app.listen(2222, () => {
            console.log("Server is successfully listening on port 2222...");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected!!");
    });