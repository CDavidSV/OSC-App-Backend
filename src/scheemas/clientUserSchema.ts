import { Schema, model } from "mongoose";

const ClientUserSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: null },
    savedAssociations: { type: [String], default: [] },
    associationsHistory: { type: [String], default: [] }
});

ClientUserSchema.index({ userId: 1 });
ClientUserSchema.index({ phoneNumber: 1 });
export default model("ClientUser", ClientUserSchema);