const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// sender setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "smssmartvote@gmail.com",   // 👈 your email
        pass: "xbnjhtmqhrntqowv"      // 👈 app password
    }
});

// SEND OTP
router.post("/send-otp", async (req, res) => {

    const { rollNo } = req.body;

    const user = await User.findOne({ rollNo });

    if (!user) {
        return res.json({ message: "Roll No not found ❌" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    await user.save();

    try {
        await transporter.sendMail({
            from: "smssmartvote@gmail.com",
            to: user.email,
            subject: "Smart Vote OTP",
            text: `Your OTP is ${otp}`
        });
        console.log("EMAIL SENT ✅");

        res.json({ message: "OTP sent to your email ✅" });

    } catch (err) {
        console.log("ERROR:", err);
        res.json({ message: "Email failed ❌" });
    }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
    try {

        const { rollNo, otp } = req.body;

        const user = await User.findOne({ rollNo });

        console.log("USER 👉", user); // 🔍 DEBUG

        if (!user) {
            return res.json({ message: "User not found ❌" });
        }

        if (user.otp != otp) {
            return res.json({ message: "Wrong OTP ❌" });
        }

        // ✅ Safe name handling
        const name = user.name || "User";

        // 🔥 OPTIONAL: clear OTP after login
        user.otp = null;
        await user.save();

        res.json({
            message: "Login success ✅",
            role: user.role,
            name: name
        });

    } catch (err) {
        console.log("ERROR 👉", err);
        res.status(500).json({ message: "Server error ❌" });
    }
});
module.exports = router;