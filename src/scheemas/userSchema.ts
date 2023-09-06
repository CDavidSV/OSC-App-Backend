import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    firebaseId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    profilePictureURL: { type: String, default: null },
    email: { type: String, default: null },
    phoneNumber: { type: String, default: null, unique: true },
    assocId: { type: String, default: null },
    assocPerms: { type: Number, default: null },
    savedAssociations: { type: [String], default: [] },
    associationHistory: { type: [String], default: [] },
});

UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
export default model("User", UserSchema);