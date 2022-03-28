import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeeService } from './employee.service';
import { GetAllDepartmentResponseDto, GetAllEmployeeResponseDto } from './employee.types';
import { PaggingOperationResult } from 'app/shared/shared.types';



@Injectable({
    providedIn: 'root'
})
export class DepartmentsResolver implements Resolve<any>
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaggingOperationResult<GetAllDepartmentResponseDto>>
    {
        return this._employeeService.getDepartments();
    }
}


@Injectable({
    providedIn: 'root'
})
export class EmployeesResolver implements Resolve<any>
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
        return this._employeeService.getEmployess();
    }
}

