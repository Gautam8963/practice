const connectDB = require("./config/db");
const express = require('express');
const { useParams } = require('react-router-dom');
const User = require('./models/User')
const app = express();
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')
app.use(express.json());
app.use(cookieParser());
// app.use(express.json());

SECRET_KEY = 'jwt@123'

const userAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const { token } = cookies;

        if (!token) throw new Error("Invalid token !!");

        const decodeToken = await jwt.verify(token, SECRET_KEY);

        const { _id } = decodeToken;

        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
}

app.post('/signup', async (req, res) => {
    try {
        const { name, password, email, age } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            age,
            password: passwordHash
        });
        await user.save();
        res.status(201).send("user added successfully");
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email })
        if (!user) {
            throw new Error("Invalid User !!!");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            // Creating a token
            const token = await jwt.sign({ _id: user._id }, SECRET_KEY);
            // adding token to cookie
            res.cookie("token", token);
            res.send("User logged in successfully");
        } else {
            throw new Error("Password not correct ");
        }

    } catch (err) {
        res.status(400).send("Error" + err.message)
    }
})

app.post('/logout',async (req,res)=> {
    res.cookie("token",null, {
        expires: new Date(Date.now()),
    })
    res.send("Logout successfully")
})

app.patch('/updateUser',userAuth, async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;

    try {
        const updated = await User.findByIdAndUpdate(userId, data, { new: true });
        res.json(updated); // updated user return karega
        console.log(updated)
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/users',userAuth, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
})

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


