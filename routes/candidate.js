const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");

// ==========================
// ➕ ADD CANDIDATE (Student)
// ==========================
router.post("/add", async (req, res) => {

    const { name, rollNo, position, photo, manifesto } = req.body;

    const candidate = new Candidate({
        name,
        rollNo,
        position, // 🔥 SAVE THIS
        photo,
        manifesto,
        status: "pending"
    });

    await candidate.save();

    res.json({ message: "Application submitted ✅" });
});
// ==========================
// 📋 GET ALL (Admin)
// ==========================
router.get("/", async (req, res) => {
    const data = await Candidate.find();
    res.json(data);
});

// ==========================
// ✅ GET APPROVED (Student)
// ==========================
router.get("/approved", async (req, res) => {
    const data = await Candidate.find({ status: "approved" });
    res.json(data);
});

// ==========================
// ✔ APPROVE
// ==========================
router.post("/approve/:id", async (req, res) => {
    await Candidate.findByIdAndUpdate(req.params.id, {
        status: "approved"
    });
    res.json({ message: "Approved ✅" });
});

// ==========================
// ❌ REJECT
// ==========================
router.post("/reject/:id", async (req, res) => {
    await Candidate.findByIdAndUpdate(req.params.id, {
        status: "rejected"
    });
    res.json({ message: "Rejected ❌" });
});

// ==========================
// 🗑 DELETE
// ==========================
router.delete("/delete/:id", async (req, res) => {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted 🗑" });
});

module.exports = router;