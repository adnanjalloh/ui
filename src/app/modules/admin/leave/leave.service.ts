import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { OperationResponseResult, OperationResult, PaggingOperationResult, Pagination, Query, QueryParam } from 'app/shared/shared.types';
import { GetAllLeaveTypeResponseDto, SearchLeaveRequestDto, SearchLeaveResponseDto, UpdateLeaveResponseDto } from './leave.types';

@Injectable({
    providedIn: 'root'
})
export class LeaveService
{
    // Private
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _leaveTypes: BehaviorSubject<GetAllLeaveTypeResponseDto[] | null> = new BehaviorSubject(null);
    private _leaves: BehaviorSubject<SearchLeaveResponseDto[] | null> = new BehaviorSubject(null);
    private _leave: BehaviorSubject<UpdateLeaveResponseDto | null> = new BehaviorSubject(null);
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
     * Getter for leave types
     */
    get _leaveTypes$(): Observable<GetAllLeaveTypeResponseDto[]>
    {
        return this._leaveTypes.asObservable();
    }


    /**
     * Getter for leaves
     */
    get _leaves$(): Observable<SearchLeaveResponseDto[]>
    {
        return this._leaves.asObservable();
    }
     

    /**
     * Getter for leave
     */
    get _leave$(): Observable<UpdateLeaveResponseDto>
    {
        return this._leave.asObservable();
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
     * Get leave types
     */
    getLeaveTypes(): Observable<PaggingOperationResult<GetAllLeaveTypeResponseDto>>
    {
        return this._httpClient.get<PaggingOperationResult<GetAllLeaveTypeResponseDto>>(this._baseUrl + 'leave/get-all-leave-types').pipe(
            tap((data) => {
                this._leaveTypes.next(data.response);
            })
        );
    }

    /**
     * Get leaves
     *
     *
     * @param page
     * @param size
     */
     getLeaves(page: number = 0, size: number = 10, employeeId: number = 0, fromDate: string = '2016-01-01', toDate: string = '2023-01-01'): Observable<PaggingOperationResult<SearchLeaveResponseDto>>
    {
        const query: QueryParam<SearchLeaveRequestDto> = {
            page: page,
            perPage: size,
            orderBy: '',
            orderDir: '',
            parameter: {
                employeeId: employeeId,
                from:  new Date(fromDate),
                to:  new Date(toDate)
            }
        };

        return this._httpClient.post<PaggingOperationResult<SearchLeaveResponseDto>>(this._baseUrl + 'leave/search-leave', query).pipe(
            tap((response) => {
                this._leaves.next(response.response);
                this._pagination.next(response.pagination);
            })
        );
    }

    /**
     * Get leave by id
     */
    getLeaveById(id: string): Observable<UpdateLeaveResponseDto>
    {
        return this._leaves.pipe(
            take(1),
            map((leaves) => {

                // Find the leave
                const leave = leaves.find(item => item.leaveId === parseInt(id)) || null;

                // Update the leave
                this._leave.next(leave);

                // Return the leave
                return leave;
            }),
            switchMap((leave) => {

                if ( !leave )
                {
                    return throwError('Could not found leave with id of ' + id + '!');
                }

                return of(leave);
            })
        );
    }

    /**
     * Create leave
     */
    createLeave(): Observable<UpdateLeaveResponseDto>
    {
        return this._leaves$.pipe(
            take(1),
            switchMap(leaves => this._httpClient.post<OperationResponseResult<UpdateLeaveResponseDto>>(this._baseUrl + 'leave/create-leave', {}).pipe(
                map((response) => {

                    const newLeave = response.response; 
                    // Update the leaves with the new leave
                    this._leaves.next([newLeave, ...leaves]);

                    // Return the new leave
                    return newLeave;
                })
            ))
        );
    }

    /**
     * Update leave
     * @param leave
     */
    updateLeave(leave: UpdateLeaveResponseDto): Observable<UpdateLeaveResponseDto>
    {
        return this._leaves$.pipe(
            take(1),
            switchMap(leaves => this._httpClient.patch<OperationResponseResult<UpdateLeaveResponseDto>>(this._baseUrl + 'leave/update-leave', leave).pipe(
                map((updatedLeaveResult) => {

                    // Find the index of the updated leave
                    const index = leaves.findIndex(item => item.leaveId === leave.leaveId);

                    // Update the leave
                    leaves[index] = updatedLeaveResult.response;

                    // Update the leaves
                    this._leaves.next(leaves);

                    // Return the updated leave
                    return updatedLeaveResult.response;
                }),
                switchMap(updatedLeave => this._leave$.pipe(
                    take(1),
                    filter(item => item && item.leaveId === leave.leaveId),
                    tap(() => {

                        // Update the leave if it's selected
                        this._leave.next(updatedLeave);

                        // Return the updated leave
                        return updatedLeave;
                    })
                ))
            ))
        );
    }

        /**
     * Delete the leave
     *
     * @param id
     */
         deleteLeave(id: number): Observable<boolean>
         {
             return this._leaves$.pipe(
                 take(1),
                 switchMap(leaves => this._httpClient.delete(this._baseUrl + 'leave/delete-leave', {params: {id}}).pipe(
                     map((operationResult: OperationResult) => {
                        const isDeleted =  operationResult.result;

                         // Find the index of the deleted leave
                         const index = leaves.findIndex(item => item.leaveId === id);
     
                         // Delete the leave
                         leaves.splice(index, 1);
     
                         // Update the leaves
                         this._leaves.next(leaves);
     
                         // Return the deleted status
                         return isDeleted;
                     })
                 ))
             );
         }
}
 
