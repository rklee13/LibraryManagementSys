export interface IUser {
    type: 'ADMIN' | 'EMPLOYEE' | 'PATRON';
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}