import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
    _id: { type: String, required: true },
    assocId: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    parentId: { type: String },
    replyId: { type: String },
    upvotes: { type: Number, required: true },
    downvotes: { type: Number, required: true },
});

CommentSchema.index({ assocId: 1 });
CommentSchema.index({ parentId: 1 });
export default model("Comment", CommentSchema);