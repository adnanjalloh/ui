import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { CreateEmployeeResponseDto, GetAllDepartmentResponseDto, GetAllEmployeeResponseDto, UpdateEmployeeRequestDto, UpdateEmployeeResponseDto } from './employee.types';
import { environment } from 'environments/environment';
import { OperationResponseResult, OperationResult, PaggingOperationResult, Pagination, Query } from 'app/shared/shared.types';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService
{
    // Private
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _departments: BehaviorSubject<GetAllDepartmentResponseDto[] | null> = new BehaviorSubject(null);
    private _employees: BehaviorSubject<GetAllEmployeeResponseDto[] | null> = new BehaviorSubject(null);
    private _allEmployees: BehaviorSubject<GetAllEmployeeResponseDto[] | null> = new BehaviorSubject(null);
    private _employee: BehaviorSubject<UpdateEmployeeRequestDto | null> = new BehaviorSubject(null);

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
     * Getter for departments
     */
    get _departments$(): Observable<GetAllDepartmentResponseDto[]>
    {
        return this._departments.asObservable();
    }


    /**
     * Getter for all employess
     */
     get _allEmployees$(): Observable<GetAllEmployeeResponseDto[]>
     {
         return this._allEmployees.asObservable();
     }
 
    /**
     * Getter for employees
     */
    get _employees$(): Observable<GetAllEmployeeResponseDto[]>
    {
        return this._employees.asObservable();
    }
     

    /**
     * Getter for employee
     */
    get _employee$(): Observable<UpdateEmployeeResponseDto>
    {
        return this._employee.asObservable();
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
     * Get departments
     */
    getDepartments(): Observable<PaggingOperationResult<GetAllDepartmentResponseDto>>
    {
        return this._httpClient.get<PaggingOperationResult<GetAllDepartmentResponseDto>>(this._baseUrl + 'department/get-all').pipe(
            tap((departments) => {
                this._departments.next(departments.response);
            })
        );
    }


        /**
     * Get all employees
     */
         getAllEmployees(): Observable<PaggingOperationResult<GetAllEmployeeResponseDto>>
         {
            const query: Query = {
                page: 0,
                perPage: 1000000,
                orderBy: '',
                orderDir: ''
                };

             return this._httpClient.post<PaggingOperationResult<GetAllEmployeeResponseDto>>(this._baseUrl + 'employee/get-all-employees', query).pipe(
                 tap((response) => {
                     this._allEmployees.next(response.response);
                 })
             );
         }
     

    /**
     * Get employees
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     */
     getEmployess(page: number = 0, size: number = 10):
        Observable<PaggingOperationResult<GetAllEmployeeResponseDto>>
    {
        const query: Query = {
            page: page,
            perPage: size,
            orderBy: '',
            orderDir: ''
            };

        return this._httpClient.post<PaggingOperationResult<GetAllEmployeeResponseDto>>(this._baseUrl + 'employee/get-all-employees', query).pipe(
            tap((response) => {
                this._employees.next(response.response);
                this._pagination.next(response.pagination);
            })
        );
    }

    /**
     * Get employee by id
     */
    getEmployeeById(id: string): Observable<UpdateEmployeeResponseDto>
    {
        return this._employees.pipe(
            take(1),
            map((employees) => {

                // Find the employee
                const employee = employees.find(item => item.employeeId === parseInt(id)) || null;

                // Update the employee
                this._employee.next(employee);

                // Return the employee
                return employee;
            }),
            switchMap((employee) => {

                if ( !employee )
                {
                    return throwError('Could not found employee with id of ' + id + '!');
                }

                return of(employee);
            })
        );
    }

    /**
     * Create employee
     */
    createEmployee(): Observable<CreateEmployeeResponseDto>
    {
        return this._employees$.pipe(
            take(1),
            switchMap(employees => this._httpClient.post<OperationResponseResult<CreateEmployeeResponseDto>>(this._baseUrl + 'employee/create-employee', {}).pipe(
                map((response) => {

                    const newEmployee = response.response; 
                    // Update the employees with the new employee
                    this._employees.next([newEmployee, ...employees]);

                    // Return the new employee
                    return newEmployee;
                })
            ))
        );
    }

    /**
     * Update employee
     * @param employee
     */
    updateEmployee(employee: UpdateEmployeeRequestDto): Observable<UpdateEmployeeResponseDto>
    {
        return this._employees$.pipe(
            take(1),
            switchMap(employees => this._httpClient.patch<OperationResponseResult<UpdateEmployeeResponseDto>>(this._baseUrl + 'employee/update-employee', employee).pipe(
                map((updatedEmployeeResult) => {

                    // Find the index of the updated employee
                    const index = employees.findIndex(item => item.employeeId === employee.employeeId);

                    // Update the employee
                    employees[index] = updatedEmployeeResult.response;

                    // Update the employees
                    this._employees.next(employees);

                    // Return the updated employee
                    return updatedEmployeeResult.response;
                }),
                switchMap(updatedEmployee => this._employee$.pipe(
                    take(1),
                    filter(item => item && item.employeeId === employee.employeeId),
                    tap(() => {

                        // Update the employee if it's selected
                        this._employee.next(updatedEmployee);

                        // Return the updated employee
                        return updatedEmployee;
                    })
                ))
            ))
        );
    }

        /**
     * Delete the employee
     *
     * @param id
     */
         deleteEmployee(id: number): Observable<boolean>
         {
             return this._employees$.pipe(
                 take(1),
                 switchMap(employees => this._httpClient.delete(this._baseUrl + 'employee/delete-employee', {params: {id}}).pipe(
                     map((operationResult: OperationResult) => {
                        const isDeleted =  operationResult.result;

                         // Find the index of the deleted employee
                         const index = employees.findIndex(item => item.employeeId === id);
     
                         // Delete the employee
                         employees.splice(index, 1);
     
                         // Update the employees
                         this._employees.next(employees);
     
                         // Return the deleted status
                         return isDeleted;
                     })
                 ))
             );
         }
}
 
