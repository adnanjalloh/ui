import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { OperationResponseResult, PaggingOperationResult } from 'app/shared/shared.types';
import { ExpenseService } from '../expense.service';
import { GetClaimDetailsResponseDto } from '../expense.types';

@Injectable({
    providedIn: 'root'
})
export class ExpenseDetailsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _expenseService: ExpenseService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<GetClaimDetailsResponseDto>>
    {
        const id = parseInt(route.paramMap.get('id'));
        return this._expenseService.getExpenseDetails(0, 10, id);
    }
}


@Injectable({
    providedIn: 'root'
})
export class ExpenseDetailTitleResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _expenseService: ExpenseService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OperationResponseResult<string>>
    {
        const id = parseInt(route.paramMap.get('id'));
        return this._expenseService.getExpenseTilte(id);
    }
}


