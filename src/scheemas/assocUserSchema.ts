import { Schema, model } from "mongoose";

const AssocUserSchema = new Schema({
    userId: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
});

AssocUserSchema.index({ userId: 1 });
export default model("AssocUser", AssocUserSchema);