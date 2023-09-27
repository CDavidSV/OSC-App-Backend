import { Schema, model } from "mongoose";

const ReviewSchema = new Schema({
    assocId: { type: Schema.Types.ObjectId, required: true, ref: 'Association' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true },
    upvotes: { type: Number, required: true },
    downvotes: { type: Number, required: true },
    rating: { type: Number, required: true },
    private: { type: Boolean, required: true }
}, { toJSON: { virtuals: true } });

ReviewSchema.index({ assocId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
export default model("Review", ReviewSchema);