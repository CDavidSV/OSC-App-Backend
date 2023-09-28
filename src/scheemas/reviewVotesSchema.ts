import { Schema, model } from "mongoose";

const reviewVotesSchema = new Schema({
    reviewId: { type: String, required: true },
    userId: { type: String, required: true },
    vote: { type: Number, required: true }
});

reviewVotesSchema.index({ reviweId: 1, userId: 1 });
export default model('ReviewVotes', reviewVotesSchema);