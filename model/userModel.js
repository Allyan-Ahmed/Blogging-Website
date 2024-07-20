const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
    fullname:String,
    email:String,
    contact:Number,
    password:String,
    role:String,
    _id:String
});

const userModel = new mongoose.model("users",userSchema);
module.exports = userModel;