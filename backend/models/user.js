import { Schema, model } from "mongoose";
import { UserData } from "./userData.js";

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username cannot be empty"],
    unique: [true, "Please choose another username"],
  },
  email: {
    type: String,
    required: [true, "Email cannot be empty"],
    unique: [true, "Please choose another username"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty"],
  },
  role: {
    type: String,
    enum: ["admin", "student", "teacher"],
    default: "student",
  },
  userDataId: {
    type: Schema.ObjectId,
    ref: "UserData",
  },
  passwordResetToken: String,
});

UserSchema.pre("save", async function (next) {
  if (!this.userDataId) {
    const userData = new UserData({ userId: this._id });
    await userData.save();
    this.userDataId = userData._id;
  }
  next();
});

export const User = model("User", UserSchema);
