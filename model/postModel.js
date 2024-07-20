const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  keywords: String,
  category: String,
  img: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = mongoose.model("posts", postSchema);
module.exports = postModel;
