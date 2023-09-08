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

export { DBUser }