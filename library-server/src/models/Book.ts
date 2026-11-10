import { ILoanRecord } from "./LoanRecord";

export interface IBook {
    barcode: string;    // ISBN 10
    cover: string;
    title: string;
    authors: string[];
    description: string;
    subjects: string[];
    publicationDate: Date;
    publisher: string;
    pages: number;
    genre: string;
    records: ILoanRecord[];
}