import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  iden: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  password: { type: String },
  name: { type: String, required: true },
  socialOnly: { type: Boolean, default: false },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
});

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 5);
});

const User = mongoose.model("User", userSchema);
export default User;
