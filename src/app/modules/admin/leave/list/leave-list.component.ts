import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Pagination } from 'app/shared/shared.types';
import { GetAllLeaveTypeResponseDto, SearchLeaveResponseDto, UpdateLeaveResponseDto } from '../leave.types';
import { LeaveService } from '../leave.service';
import { EmployeeService } from '../../employee/employee.service';
import { GetAllEmployeeResponseDto } from '../../employee/employee.types';

@Component({
    selector       : 'leave-list',
    templateUrl    : './leave-list.component.html',
    styles         : [
        /* language=SCSS */
        `
            .leave-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class LeaveListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    leaves$: Observable<SearchLeaveResponseDto[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: Pagination;
    selectedLeave: UpdateLeaveResponseDto | null = null;
    selectedLeaveForm: FormGroup;
    leaveTypes: GetAllLeaveTypeResponseDto[];
    employees: GetAllEmployeeResponseDto[];
    searchEmployeeControl: FormControl = new FormControl();
    searchFormDateControl: FormControl = new FormControl();
    searchToDateControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _leaveService: LeaveService,
        private _employeeService: EmployeeService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.searchFormDateControl.setValue(new Date('2016-01-01'));
        this.searchToDateControl.setValue(new Date('2022-12-12'));
        this.searchEmployeeControl.setValue('0');

        // Create the selected leave form
        this.selectedLeaveForm = this._formBuilder.group({
            leaveId                  : [''],
            employeeId               : ['', [Validators.required]],
            from                     : ['', [Validators.required]],
            to                       : ['', [Validators.required]],
            note                     : [''],
            leaveTypeId              : ['', [Validators.required]],
        });

        // Get the leaveTypes
        this._leaveService._leaveTypes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((leaveTypes: GetAllLeaveTypeResponseDto[]) => {


                // Update the leave types
                this.leaveTypes = leaveTypes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the employees
         this._employeeService._allEmployees$
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe((employees: GetAllEmployeeResponseDto[]) => {


             // Update the employees
             this.employees = employees;

             // Mark for check
             this._changeDetectorRef.markForCheck();
         });


        // Get the pagination
        this._leaveService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


            this.searchEmployeeControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._leaveService.getLeaves(0, 10, query,this.searchFormDateControl.value, this.searchToDateControl.value);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();


            this.searchToDateControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._leaveService.getLeaves(0, 10, this.searchEmployeeControl.value, this.searchFormDateControl.value, query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

            // Get the leaves
            this.leaves$ = this._leaveService._leaves$; 
}

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        if ( this._paginator )
        {
            // Mark for check
            this._changeDetectorRef.markForCheck();

            // Get leaves if page changes
            merge(this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._leaveService.getLeaves(this._paginator.pageIndex, this._paginator.pageSize, this.searchEmployeeControl.value, this.searchFormDateControl.value, this.searchToDateControl.value);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle leave details
     *
     * @param leaveId
     */
    toggleDetails(leaveId: string): void
    {
        // If the leave is already selected...
        if ( this.selectedLeave && this.selectedLeave.employeeId === parseInt(leaveId) )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the leave by id
        this._leaveService.getLeaveById(leaveId)
            .subscribe((leave) => {

                // Set the selected leave
                this.selectedLeave = leave;

                // Fill the form
                this.selectedLeaveForm.patchValue(leave);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedLeave = null;
    }


    /**
     * Create leave
     */
    createLeave(): void
    {
        // Create the leave
        this._leaveService.createLeave().subscribe((newLeave) => {

            // Go to new leave
            this.selectedLeave = newLeave;

            // Fill the form
            this.selectedLeaveForm.patchValue(newLeave);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected leave using the form data
     */
    updateSelectedLeave(): void
    {
        // Get the leave object
        const leave = this.selectedLeaveForm.getRawValue();

        // Update the leave on the server
        this._leaveService.updateLeave(leave).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected leave using the form data
     */
    deleteSelectedLeave(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Leave',
            message: 'Are you sure you want to remove this leave? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {

                // Get the leave object
                const leave = this.selectedLeaveForm.getRawValue();

                // Delete the leave on the server
                this._leaveService.deleteLeave(leave.leaveId).subscribe(() => {

                    // Close the details
                    this.closeDetails();
                });
            }
        });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void
    {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.leaveId || index;
    }
}
