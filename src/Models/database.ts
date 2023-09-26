import mongoose from "mongoose";

interface DBUser {
    _id: mongoose.Types.ObjectId;
    firebaseId: string;
    username: string;
    profilePictureURL?: string;
    email?: string;
    phoneNumber?: string;
    assocId?: string;
    assocPerms?: number;
    savedAssociations: string[];
    associationHistory: string[];
}
  
interface DBReview {
    _id: mongoose.Types.ObjectId;
    assocId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    rating: number;
    private: boolean;
}

interface DBReviewWithUser extends DBReview {
    user: DBUser;
}

export { DBUser, DBReview, DBReviewWithUser };