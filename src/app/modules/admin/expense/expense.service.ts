import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { OperationResponseResult, OperationResult, PaggingOperationResult, Pagination, QueryParam } from 'app/shared/shared.types';
import { GetClaimDetailsRequestDto, GetClaimDetailsResponseDto, SearchExpenseClaimRequestDto, SearchExpenseClaimResponseDto, UpdateExpenseDetailRequestDto, UpdateExpenseDetailResponseDto, UpdateExpenseRequestDto, UpdateExpenseResponseDto } from './expense.types';
import { GetAllLeaveTypeResponseDto } from '../leave/leave.types';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    // Private
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _expenses: BehaviorSubject<SearchExpenseClaimResponseDto[] | null> = new BehaviorSubject(null);
    private _expense: BehaviorSubject<UpdateExpenseResponseDto | null> = new BehaviorSubject(null);
    private _expenseDetails: BehaviorSubject<GetClaimDetailsResponseDto[] | null> = new BehaviorSubject(null);
    private _expenseDetail: BehaviorSubject<UpdateExpenseDetailResponseDto | null> = new BehaviorSubject(null);
    private _baseUrl: string = environment.apiUrl;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    /**
     * Getter for expenses
     */
    get _expenses$(): Observable<SearchExpenseClaimResponseDto[]> {
        return this._expenses.asObservable();
    }


    /**
     * Getter for expense
     */
    get _expense$(): Observable<UpdateExpenseResponseDto> {
        return this._expense.asObservable();
    }



    /**
    * Getter for expense details
    */
    get _expenseDetails$(): Observable<GetClaimDetailsResponseDto[]> {
        return this._expenseDetails.asObservable();
    }




    /**
    * Getter for expenses detail
    */
    get _expensesDetail$(): Observable<UpdateExpenseDetailResponseDto> {
        return this._expenseDetail.asObservable();
    }


    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get expenses
     *
     *
     * @param page
     * @param size
     */
    getExpenses(page: number = 0, size: number = 10, employeeId: number = 0): Observable<PaggingOperationResult<SearchExpenseClaimResponseDto>> {
        const query: QueryParam<SearchExpenseClaimRequestDto> = {
            page: page,
            perPage: size,
            orderBy: '',
            orderDir: '',
            parameter: {
                employeeId: employeeId
            }
        };

        return this._httpClient.post<PaggingOperationResult<SearchExpenseClaimResponseDto>>(this._baseUrl + 'expense/search-expense-claim', query).pipe(
            tap((response) => {
                this._expenses.next(response.response);
                this._pagination.next(response.pagination);
            })
        );
    }

    /**
     * Get expense details
     *
     *
     * @param page
     * @param size
     * @param expenseId
     */
    getExpenseDetails(page: number = 0, size: number = 10, claimId: number = 0): Observable<PaggingOperationResult<GetClaimDetailsResponseDto>> {
        const query: QueryParam<GetClaimDetailsRequestDto> = {
            page: page,
            perPage: size,
            orderBy: '',
            orderDir: '',
            parameter: {
                claimId: claimId
            }
        };

        return this._httpClient.post<PaggingOperationResult<GetClaimDetailsResponseDto>>(this._baseUrl + 'expense/get-expense-claim-details', query).pipe(
            tap((response) => {
                this._expenseDetails.next(response.response);
                this._pagination.next(response.pagination);
            })
        );
    }

    /**
     * Get expense by id
     */
    getExpenseById(id: string): Observable<UpdateExpenseResponseDto> {
        return this._expenses.pipe(
            take(1),
            map((expenses) => {

                // Find the expense
                const expense = expenses.find(item => item.expenseClaimId === parseInt(id)) || null;

                // Update the expense
                this._expense.next(expense);

                // Return the expense
                return expense;
            }),
            switchMap((expense) => {

                if (!expense) {
                    return throwError('Could not found expense with id of ' + id + '!');
                }

                return of(expense);
            })
        );
    }


    /**
    * Get expense Detail by id
    */
    getExpenseDetailById(id: string): Observable<UpdateExpenseDetailResponseDto> {
        return this._expenseDetails.pipe(
            take(1),
            map((expenseDetails) => {

                // Find the expense detail
                const expenseDetail = expenseDetails.find(item => item.expenseClaimDetailId === parseInt(id)) || null;

                // Update the expense detail
                this._expenseDetail.next(expenseDetail);

                // Return the expense detail
                return expenseDetail;
            }),
            switchMap((expenseDetail) => {

                if (!expenseDetail) {
                    return throwError('Could not found expense detail with id of ' + id + '!');
                }

                return of(expenseDetail);
            })
        );
    }

    /**
     * Create expense
     */
    createExpense(): Observable<UpdateExpenseResponseDto> {
        return this._expenses$.pipe(
            take(1),
            switchMap(expenses => this._httpClient.post<OperationResponseResult<UpdateExpenseResponseDto>>(this._baseUrl + 'expense/create-expense-claim', {}).pipe(
                map((response) => {

                    const newExpenses = response.response;
                    // Update the leaves with the new expense
                    this._expenses.next([newExpenses, ...expenses]);

                    // Return the new expenses
                    return newExpenses;
                })
            ))
        );
    }

    /**
     * Create expense detail
     */
    createExpenseDetail(): Observable<UpdateExpenseDetailResponseDto> {
        return this._expenseDetails$.pipe(
            take(1),
            switchMap(expenseDetails => this._httpClient.post<OperationResponseResult<UpdateExpenseDetailResponseDto>>(this._baseUrl + 'expense/create-expense-claim-detail', {}).pipe(
                map((response) => {

                    const newExpenseDetail = response.response;
                    // Update the expense Details with the new expense detail
                    this._expenseDetails.next([newExpenseDetail, ...expenseDetails]);

                    // Return the new expense details
                    return newExpenseDetail;
                })
            ))
        );
    }

    /**
     * Update expense
     * @param expense
     */
    updateExpense(expense: UpdateExpenseRequestDto): Observable<UpdateExpenseResponseDto> {
        return this._expenses$.pipe(
            take(1),
            switchMap(expenses => this._httpClient.patch<OperationResponseResult<UpdateExpenseResponseDto>>(this._baseUrl + 'expense/update-expense-claim', expense).pipe(
                map((updatedExpenseResult) => {

                    // Find the index of the updated expense
                    const index = expenses.findIndex(item => item.expenseClaimId === expense.expenseClaimId);

                    // Update the expense
                    expenses[index] = updatedExpenseResult.response;

                    // Update the expenses
                    this._expenses.next(expenses);

                    // Return the updated expense
                    return updatedExpenseResult.response;
                }),
                switchMap(updatedExpense => this._expense$.pipe(
                    take(1),
                    filter(item => item && item.expenseClaimId === expense.expenseClaimId),
                    tap(() => {

                        // Update the expense if it's selected
                        this._expense.next(updatedExpense);

                        // Return the updated expense
                        return updatedExpense;
                    })
                ))
            ))
        );
    }

    /**
    * Update expense detail
    * @param expenseDetail
    */
    updateExpenseDetail(expenseDetail: UpdateExpenseDetailRequestDto): Observable<UpdateExpenseDetailResponseDto> {
        return this._expenseDetails$.pipe(
            take(1),
            switchMap(expenseDetails => this._httpClient.patch<OperationResponseResult<UpdateExpenseDetailResponseDto>>(this._baseUrl + 'expense/update-expense-claim-detail', expenseDetail).pipe(
                map((expenseDetailsResult) => {

                    // Find the index of the updated expense detail
                    const index = expenseDetails.findIndex(item => item.expenseClaimId === expenseDetail.expenseClaimId);

                    // Update the expense detail
                    expenseDetails[index] = expenseDetailsResult.response;

                    // Update the expense details
                    this._expenseDetail.next(expenseDetail);

                    // Return the updated expense detail
                    return expenseDetailsResult.response;
                }),
                switchMap(updatedExpenseDetail => this._expensesDetail$.pipe(
                    take(1),
                    filter(item => item && item.expenseClaimDetailId === expenseDetail.expenseClaimDetailId),
                    tap(() => {

                        // Update the expense detail if it's selected
                        this._expenseDetail.next(updatedExpenseDetail);

                        // Return the updated expense detail
                        return updatedExpenseDetail;
                    })
                ))
            ))
        );
    }


    /**
 * Delete the expense
 *
 * @param id
 */
    deleteExpense(id: number): Observable<boolean> {
        return this._expenses$.pipe(
            take(1),
            switchMap(expenses => this._httpClient.delete(this._baseUrl + 'expense/delete-expense', { params: { id } }).pipe(
                map((operationResult: OperationResult) => {
                    const isDeleted = operationResult.result;

                    // Find the index of the deleted expense
                    const index = expenses.findIndex(item => item.expenseClaimId === id);

                    // Delete the expense
                    expenses.splice(index, 1);

                    // Update the expenses
                    this._expenses.next(expenses);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
    * Delete the expense detail
    *
    * @param id
    */
    deleteExpenseDetail(id: number): Observable<boolean> {
        return this._expenseDetails$.pipe(
            take(1),
            switchMap(expenseDetails => this._httpClient.delete(this._baseUrl + 'expense/delete-expense-detail', { params: { id } }).pipe(
                map((operationResult: OperationResult) => {
                    const isDeleted = operationResult.result;

                    // Find the index of the deleted expense detail
                    const index = expenseDetails.findIndex(item => item.expenseClaimDetailId === id);

                    // Delete the expense detail
                    expenseDetails.splice(index, 1);

                    // Update the expense details
                    this._expenseDetails.next(expenseDetails);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get expense by id from server 
     * @param id
     * */
    getExpenseTilte(id: number = 0): Observable<string> {
        return this._httpClient.get<OperationResponseResult<string>>(this._baseUrl + 'expense/get-expense-title', { params: { id } }).pipe(
            map((response) => {
                return response.response;
            }   
        ));
    }
}

