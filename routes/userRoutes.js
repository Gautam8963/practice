// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'jwt@123';

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error("Invalid token !!");

        const decodeToken = await jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decodeToken._id);
        if (!user) throw new Error("User not found");

        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
};

// Routes
router.post('/signup', async (req, res) => {
    try {
        const { name, password, email, age } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, age, password: passwordHash });
        await user.save();
        res.status(201).send("User added successfully");
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid User !!!");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ _id: user._id }, SECRET_KEY);
            res.cookie("token", token);
            res.send("User logged in successfully");
        } else {
            throw new Error("Password not correct");
        }
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

router.post('/logout', async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout successfully");
});

router.patch('/updateUser', userAuth, async (req, res) => {
    try {
        const userId = req.body.userId;
        const updated = await User.findByIdAndUpdate(userId, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/users', userAuth, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.get('/profile', userAuth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

module.exports = router;