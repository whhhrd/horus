export interface SpringPage<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    first: boolean;
    numberOfElements: number;
    number: number;
    empty: boolean;
}
