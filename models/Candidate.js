const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    name: String,
    rollNo: String,
    position: String,
    photo: String,
    manifesto: String,

    votes: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        default: "pending" // pending | approved | rejected
    }
});

module.exports = mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);