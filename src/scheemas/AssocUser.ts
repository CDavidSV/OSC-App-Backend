import { Schema, model } from "mongoose";

const AssocUserSchema = new Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    profilePictureURL: { type: String },
});

AssocUserSchema.index({ userId: 1 });
export default model("AssocUser", AssocUserSchema);