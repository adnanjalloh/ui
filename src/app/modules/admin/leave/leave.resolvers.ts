import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PaggingOperationResult } from 'app/shared/shared.types';
import { LeaveService } from './leave.service';
import { GetAllLeaveTypeResponseDto, SearchLeaveResponseDto } from './leave.types';
import { EmployeeService } from '../employee/employee.service';
import { GetAllEmployeeResponseDto } from '../employee/employee.types';



@Injectable({
    providedIn: 'root'
})
export class LeaveTypesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _leaveService: LeaveService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<GetAllLeaveTypeResponseDto>>
    {
        return this._leaveService.getLeaveTypes();
    }
}


@Injectable({
    providedIn: 'root'
})
export class LeaveResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _leaveService: LeaveService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<SearchLeaveResponseDto>>
    {
        return this._leaveService.getLeaves();
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

