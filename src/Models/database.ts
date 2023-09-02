interface DBUser {
    userId: string,
    username: string,
    profilePictureURL: string,
}

interface ClientUser {
    id: string;
    userId: string;
    phoneNumber: string;
    savedAssociations: string[];
    associationsHistory: string[];
}

export { DBUser, ClientUser }