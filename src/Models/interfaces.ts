interface PhoneVerificationCode {
    userId: string;
    code: string;
    expiresIn: number;
}

interface User {
    id: string;
    refresh: boolean;
}

export { PhoneVerificationCode, User }