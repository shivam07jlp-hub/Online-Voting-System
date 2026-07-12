const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:String,
    rollNo: String,
    email: String,
    otp: String,
    role: String, // admin / student
    isVerified: Boolean
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);