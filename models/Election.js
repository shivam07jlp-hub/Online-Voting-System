const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
    title: String,
    startTime: Date,
    endTime: Date,

    isDeclared: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.models.Election || mongoose.model("Election", electionSchema);