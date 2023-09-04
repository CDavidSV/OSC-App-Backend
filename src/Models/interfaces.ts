interface User {
    id?: string;
    refresh: boolean;
    allowedRoutes?: string[];
    phoneNumber?: string;
}

export { User }