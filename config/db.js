const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connect('mongodb+srv://gautam:ZnSeIdkvAZ1v2rZ6@devtinderr.bzsbz.mongodb.net/Practice')
}
connectDB()
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log("❌ Connection Error:", err));

module.exports = connectDB;