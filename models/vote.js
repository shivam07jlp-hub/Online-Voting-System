const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
    userId: String,
    position: String
});

module.exports = mongoose.models.Vote || mongoose.model("Vote", voteSchema);

