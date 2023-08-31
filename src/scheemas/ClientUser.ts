import { Schema, model } from "mongoose";

const ClientUserSchema = new Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true },
    phoneNumber: { type: String },
    profilePictureURL: { type: String },
    savedAssociations: { type: [String] },
    AssociationsHistory: { type: [String] }
});

ClientUserSchema.index({ userId: 1 });
export default model("ClientUser", ClientUserSchema);