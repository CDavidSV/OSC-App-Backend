import { Schema, model } from "mongoose";

const AssocUserSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    association: { type: String, required: true },
    perms: { type: [String], required: true },
});

AssocUserSchema.index({ userId: 1 });
AssocUserSchema.index({ association: 1 });
export default model("AssocUser", AssocUserSchema);