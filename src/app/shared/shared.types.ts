export interface OperationResult {
    result: boolean;
    message: string;
    errors: Error[];
}

export interface OperationResponseResult<TResponse> extends OperationResult {
    response: TResponse;
}

export interface PaggingOperationResult<TResponse> extends OperationResponseResult<TResponse[]> {
    pagination: Pagination;
}

export interface Pagination {
    totalResults: number;
    currentPage: number;
    resultsPerPage: number;
    pages: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface Error {
    errorMessage: string;
}


export interface Query {
    page: number;
    perPage: number;
    orderBy: string;
    orderDir: string;
}

export interface QueryParam<T> extends Query {
    parameter: T;
}