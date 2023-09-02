import { Schema, model } from 'mongoose';

const TagSchema = new Schema({
    name: { type: String, required: true },
});

TagSchema.index({ name: 1 });
export default model('Tag', TagSchema);