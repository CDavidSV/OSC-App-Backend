import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
    _id: { type: String, required: true },
    assocId: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    parentId: { type: String, default: null },
    replyId: { type: String, default: null },
    upvotes: { type: Number, required: true },
    downvotes: { type: Number, required: true },
});

CommentSchema.index({ assocId: 1 });
CommentSchema.index({ parentId: 1 });
export default model("Comment", CommentSchema);