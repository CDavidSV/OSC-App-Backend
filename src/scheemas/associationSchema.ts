import { Schema, model } from "mongoose";

const AssociationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    logoURL: { type: String, default: null },
    images: { type: [String], default: [] },
    thumbnailURL: { type: String, default: null },
    websiteURL: { type: String, default: null },
    facebookURL: { type: String, default: null },
    instagramURL: { type: String, default: null },
    categoryId: { type: Schema.Types.ObjectId, required: true },
    tags: { type: [String], default: [] },
    contact : {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        whatsapp: { type: String, default: null },
    },
    address: { type: String, required: true },
    rating: { type: Number, required: true }
});

AssociationSchema.index({ name: 1});
AssociationSchema.index({ category: 1});
export default model("Association", AssociationSchema);