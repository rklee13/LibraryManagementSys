export class UnableToSaveUserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnableToSaveUserError';
    }
}

export class InvalidUserAndPasswordError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidUserAndPasswordError';
    }
}

export class UserDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserDoesNotExistError';
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserAlreadyExistsError';
    }
}

export class CannotDeleteOwnAccountError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CannotDeleteOwnAccountError';
    }
}

export class BookDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BookDoesNotExistError';
    }
}

export class LibraryCardDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LibraryCardDoesNotExistError';
    }
}

export class LoanRecordDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LoanRecordDoesNotExistError';
    }
}