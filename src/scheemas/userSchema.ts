import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    firebaseId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    profilePictureURL: { type: String },
    email: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    assocId: { type: String },
    assocPerms: { type: Number },
    savedAssociations: { type: [Schema.Types.ObjectId], default: [] }
});

UserSchema.index({ username: 1 });
export default model("User", UserSchema);