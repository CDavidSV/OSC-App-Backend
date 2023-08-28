import { Schema, model } from "mongoose";

const ReviewSchema = new Schema({
    _id: { type: String, required: true },
    assocId: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    upvotes: { type: Number, required: true },
    downvotes: { type: Number, required: true },
    rating: { type: Number, required: true },
    private: { type: Boolean, required: true },
    showUser: { type: Boolean, required: true },
});

ReviewSchema.index({ assocId: 1 });
export default model("Review", ReviewSchema);