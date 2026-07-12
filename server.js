const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());

// 🔗 MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/smartvote")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ IMPORT MODELS
const Candidate = require("./models/Candidate");
const Vote = require("./models/vote");

// ✅ ROUTES
app.use("/api/candidates", require("./routes/candidate"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/election", require("./routes/election"));

// ==========================
// 🗳️ VOTE API
// ==========================

app.post("/vote", async (req, res) => {
    
    // 🔒 CHECK IF RESULT DECLARED
    const election = await Election.findOne();

    if (election && election.isDeclared) {
        return res.json({ message: "Voting closed ❌" });
    }
    const { userId, candidateId, position } = req.body;

    try {

        const alreadyVoted = await Vote.findOne({ userId, position });

        if (alreadyVoted) {
            return res.status(400).json({
                message: `Already voted for ${position} ❌`
            });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found ❌"
            });
        }

        if (candidate.position !== position) {
            return res.status(400).json({
                message: "Invalid vote ❌"
            });
        }

        await Vote.create({ userId, position });

        candidate.votes += 1;
        await candidate.save();

        res.json({ message: "Vote successful ✅" });

        const existing = await Vote.findOne({ userId });

        if (existing) {
         return res.json({ message: "Already voted ❌" });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// disable after voting
app.post("/vote-both", async (req, res) => {
    const { userId, crId, dcrId } = req.body;

    try {

        const election = await Election.findOne();

        if (election.isDeclared) {
            return res.json({ message: "Voting closed ❌" });
        }

        const already = await Vote.findOne({ userId });

        if (already) {
            return res.json({ message: "Already voted ❌" });
        }

        // save vote record
        await Vote.create({ userId });

        // increase votes
        await Candidate.findByIdAndUpdate(crId, { $inc: { votes: 1 } });
        await Candidate.findByIdAndUpdate(dcrId, { $inc: { votes: 1 } });

        res.json({ message: "Vote submitted successfully ✅" });

    } catch (err) {
        res.status(500).json({ message: "Error ❌" });
    }
});

// ==========================
// 📊 GET CANDIDATES
// ==========================

app.get("/candidates", async (req, res) => {
    const data = await Candidate.find({ status: "approved" }); // 🔥 only approved
    res.json(data);
});

// admin dashboard


app.get("/api/stats", async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalVotes = await Vote.countDocuments();
        const totalCandidates = await Candidate.countDocuments({ status: "approved" });

        res.json({
            totalStudents,
            totalVotes,
            totalCandidates
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

// result page
app.get("/api/results", async (req, res) => {
    try {
        const candidates = await Candidate.find({ status: "approved" });

        res.json(candidates);

    } catch (err) {
        res.status(500).json({ message: "Error ❌" });
    }
});

// declare result
const Election = require("./models/Election");

app.post("/api/declare", async (req, res) => {
    try {

        const election = await Election.findOne();

        // ❌ already declared
        if (election.isDeclared) {
            return res.json({ message: "Already Declared ❌" });
        }

        const candidates = await Candidate.find({ status: "approved" });

        let cr = candidates.filter(c => c.position === "CR");
        let dcr = candidates.filter(c => c.position === "DCR");

        // 🏆 winners
        const crWinner = cr.length ? cr.reduce((a, b) => a.votes > b.votes ? a : b) : null;
        const dcrWinner = dcr.length ? dcr.reduce((a, b) => a.votes > b.votes ? a : b) : null;

        // ✅ SAVE DECLARE STATUS
        election.isDeclared = true;
        await election.save();

        res.json({
            message: "Results Declared ✅",
            crWinner,
            dcrWinner
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error ❌" });
    }
});

// ==========================
// 🚀 START SERVER
// ==========================

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});