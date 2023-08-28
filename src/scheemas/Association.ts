import { Schema, model } from "mongoose";

const AssociationSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    logoURL: { type: String },
    thumbnailURL: { type: String },
    websiteURL: { type: String },
    facebookURL: { type: String },
    twitterURL: { type: String },
    instagramURL: { type: String },
    linkedinURL: { type: String },
    youtubeURL: { type: String },
    category: { type: String, required: true },
    tags: { type: [String] },
    contact : {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        whatsapp: { type: String },
    },
    address: { type: String, required: true },
    rating: { type: Number, required: true }
});

AssociationSchema.index({ name: 1});
AssociationSchema.index({ category: 1});
export default model("Association", AssociationSchema);