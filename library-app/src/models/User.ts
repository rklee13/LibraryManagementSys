export type User = {
    _id: string;
    type: 'ADMIN' | 'EMPLOYEE' | 'PATRON';
    email: string;
    firstName: string;
    lastName: string;
}

export interface LoginUserPayload {
    email: string;
    password: string;
}

// Payload when we register/sign up a new user
// Will dispatch object to reducer to determine how to register them
export interface RegisterUserPayload {
    type: 'ADMIN' | 'EMPLOYEE' | 'PATRON';
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

// Interface for fetching user profile
export interface FetchUserPayload {
    userId: string,
    property: 'loggedInUser' | 'profileUser'
}