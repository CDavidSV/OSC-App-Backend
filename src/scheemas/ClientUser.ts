import { Schema, model } from "mongoose";

const ClientUserSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    savedAssociations: { type: [String] },
});

ClientUserSchema.index({ userId: 1 });
export default model("ClientUser", ClientUserSchema);