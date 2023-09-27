import { Schema, model } from "mongoose";

const reviewVotesSchema = new Schema({
    reviewId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    vote: { type: Number, required: true }
});

reviewVotesSchema.index({ reviweId: 1 });
reviewVotesSchema.index({ userId: 1 });
export default model('ReviewVotes', reviewVotesSchema);