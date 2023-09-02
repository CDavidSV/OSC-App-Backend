import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, required: true },
    profilePictureURL: { type: String, default: null },
});

UserSchema.index({ username: 1 });
export default model("User", UserSchema);