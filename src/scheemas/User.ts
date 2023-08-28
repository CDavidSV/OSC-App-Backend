import { Schema, model } from "mongoose";

const UserScheema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    passwordHash: { type: String, required: true },
    type: { type: String, required: true },
    profilePictureURL: { type: String },
});

UserScheema.index({ username: 1});
export default model("User", UserScheema);