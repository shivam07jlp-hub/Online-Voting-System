const express = require("express");
const router = express.Router();
const Election = require("../models/Election");

// ==========================
// 💾 SAVE SETTINGS
// ==========================
router.post("/save", async (req, res) => {
    try {

        const { title, startTime, endTime } = req.body;

        // 🔥 ALWAYS REPLACE (UPSERT)
        const election = await Election.findOneAndUpdate(
            {},
            {
                title,
                startTime,
                endTime,
                isDeclared: false   // 🔥 FORCE RESET
            },
            {
                new: true,
                upsert: true   // create if not exists
            }
        );

        res.json({
            message: "Election saved & reset ✅",
            election
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ==========================
// 📊 GET SETTINGS
// ==========================
router.get("/", async (req, res) => {

    const election = await Election.findOne();

    res.json(election);
});

module.exports = router;