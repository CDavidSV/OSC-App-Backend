interface TokenUser {
    id: string;
}

interface User {
    id: string;
    username: string;
    profilePictureURL: string;
}

interface Review {
    id: string;
    assocId: string;
    user: User;
    content: string;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    rating: number;
    private: boolean;
    vote: number;
}

interface SavedAssociation {
    id: string;
    name: string;
    description: string;
    logoURL: string;
    rating: number;
}

export { TokenUser, User, Review, SavedAssociation }