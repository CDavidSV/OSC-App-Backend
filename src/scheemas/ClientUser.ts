import { Schema, model } from "mongoose";

const ClientUserSchema = new Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true },
    phoneNumber: { type: String, default: null },
    profilePictureURL: { type: String, default: null },
    savedAssociations: { type: [String], default: [] },
    AssociationsHistory: { type: [String], default: [] }
});

ClientUserSchema.index({ phoneNumber: 1 });
export default model("ClientUser", ClientUserSchema);