import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PaggingOperationResult } from 'app/shared/shared.types';
import { EmployeeService } from '../employee/employee.service';
import { GetAllEmployeeResponseDto } from '../employee/employee.types';
import { ExpenseService } from './expense.service';
import { GetClaimDetailsResponseDto, SearchExpenseClaimResponseDto } from './expense.types';



@Injectable({
    providedIn: 'root'
})
export class ExpensesResolver implements Resolve<any>
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<SearchExpenseClaimResponseDto>>
    {
        return this._expenseService.getExpenses();
    }
}



@Injectable({
    providedIn: 'root'
})
export class AllEmployeesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _employeeService: EmployeeService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<GetAllEmployeeResponseDto>>
    {
        return this._employeeService.getAllEmployees();
    }
}


