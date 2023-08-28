import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
});

CategorySchema.index({ name: 1});
export default model("Category", CategorySchema);