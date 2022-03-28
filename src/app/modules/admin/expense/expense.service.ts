import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { OperationResponseResult, OperationResult, PaggingOperationResult, Pagination, QueryParam } from 'app/shared/shared.types';
import { SearchExpenseClaimRequestDto, SearchExpenseClaimResponseDto, UpdateExpenseRequestDto, UpdateExpenseResponseDto } from './expense.types';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService
{
    // Private
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _expenses: BehaviorSubject<SearchExpenseClaimResponseDto[] | null> = new BehaviorSubject(null);
    private _expense: BehaviorSubject<UpdateExpenseResponseDto | null> = new BehaviorSubject(null);
    private _baseUrl: string = environment.apiUrl;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    /**
     * Getter for expenses
     */
    get _expenses$(): Observable<SearchExpenseClaimResponseDto[]>
    {
        return this._expenses.asObservable();
    }
     

    /**
     * Getter for expense
     */
    get _expense$(): Observable<UpdateExpenseResponseDto>
    {
        return this._expense.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination>
    {
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
     getExpenses(page: number = 0, size: number = 10, employeeId: number = 0): Observable<PaggingOperationResult<SearchExpenseClaimResponseDto>>
    {
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
     * Get expense by id
     */
    getExpenseById(id: string): Observable<UpdateExpenseResponseDto>
    {
        return this._expenses.pipe(
            take(1),
            map((leaves) => {

                // Find the expense
                const leave = leaves.find(item => item.expenseClaimId === parseInt(id)) || null;

                // Update the expense
                this._expense.next(leave);

                // Return the expense
                return leave;
            }),
            switchMap((expense) => {

                if ( !expense )
                {
                    return throwError('Could not found expense with id of ' + id + '!');
                }

                return of(expense);
            })
        );
    }

    /**
     * Create expense
     */
    createExpense(): Observable<UpdateExpenseResponseDto>
    {
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
     * Update expense
     * @param expense
     */
    updateExpense(expense: UpdateExpenseRequestDto): Observable<UpdateExpenseResponseDto>
    {
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
     * Delete the expense
     *
     * @param id
     */
         deleteExpense(id: number): Observable<boolean>
         {
             return this._expenses$.pipe(
                 take(1),
                 switchMap(expenses => this._httpClient.delete(this._baseUrl + 'expense/delete-expense', {params: {id}}).pipe(
                     map((operationResult: OperationResult) => {
                        const isDeleted =  operationResult.result;

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
}
 
