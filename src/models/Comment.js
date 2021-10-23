import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  createAt: { type: Date, default: Date.now },
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
});

const model = mongoose.model("Comment", commentSchema);
export default model;
