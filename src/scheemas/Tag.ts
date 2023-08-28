import { Schema, model } from 'mongoose';

const TagSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
});

TagSchema.index({ name: 1 });
export default model('Tag', TagSchema);