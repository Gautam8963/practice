const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // validation
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password : {
        type: String,
        required : true,
      },
      age: {
        type: Number,
        default: 18,
      }
});

const User = mongoose.model('User',userSchema);

module.exports = User;