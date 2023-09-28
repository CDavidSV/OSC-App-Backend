import mongoose, { Schema, model } from "mongoose";

const colaboratorSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    perms: { type: Number, required: true },
});

const AssociationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    ownerId: { type: String, required: true },
    colaborators: { type: [colaboratorSchema], default: [] },
    logoURL: { type: String, default: null },
    images: { type: [String], default: [] },
    websiteURL: { type: String, default: null },
    facebookURL: { type: String, default: null },
    instagramURL: { type: String, default: null },
    categoryId: { type: Schema.Types.ObjectId, required: true },
    tags: { type: [String], default: [] },
    contact: {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        whatsapp: { type: String, default: null },
    },
    address: { type: String, required: true },
    verified: { type: Boolean, required: true }
});

AssociationSchema.index({ name: 1 });
AssociationSchema.index({ category: 1 });
AssociationSchema.index({ tags: 1 });
export default model("Association", AssociationSchema);