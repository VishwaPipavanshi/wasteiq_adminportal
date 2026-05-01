import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    profile_pic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
