interface DBUser {
    id: string;
    firebaseId: string;
    username: string;
    profilePictureURL: string;
    email: string;
    phoneNumber: string;
    assocPerms: string;
    savedAssociations: string[];
    associationsHistory: string[];
}

interface DBAssociation {
    id: string;
    name: string;
    description: string;
    logoURL: string;
    images: string[];
    thumbnailURL: string;
    websiteURL: string;
    facebookURL: string;
    instagramURL: string;
    categoryId: string;
    tags: string[];
    contact : object;
    address: string;
    rating: number;
}

export { DBUser, DBAssociation }