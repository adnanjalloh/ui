import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EmployeeService } from '../employee.service';
import { GetAllDepartmentResponseDto, GetAllEmployeeResponseDto, UpdateEmployeeResponseDto } from '../employee.types';
import { Pagination } from 'app/shared/shared.types';

@Component({
    selector       : 'employee-list',
    templateUrl    : './employee-list.component.html',
    styles         : [
        /* language=SCSS */
        `
            .employee-grid {
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
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    employees$: Observable<GetAllEmployeeResponseDto[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: Pagination;
    selectedEmployee: UpdateEmployeeResponseDto | null = null;
    selectedEmployeeForm: FormGroup;
    departments: GetAllDepartmentResponseDto[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
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
        // Create the selected employee form
        this.selectedEmployeeForm = this._formBuilder.group({
            employeeId               : [''],
            departmentId             : ['', [Validators.required]],
            name                     : ['', [Validators.required]],
            email                    : ['', [Validators.required, Validators.email]],
            address                  : [''],
        });

        // Get the departments
        this._employeeService._departments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((departments: GetAllDepartmentResponseDto[]) => {


                // Update the departments
                this.departments = departments;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._employeeService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the employees
        this.employees$ = this._employeeService._employees$;

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

            // Get employees if page changes
            merge(this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._employeeService.getEmployess(this._paginator.pageIndex, this._paginator.pageSize);
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
     * Toggle employee details
     *
     * @param employeeId
     */
    toggleDetails(employeeId: string): void
    {
        // If the employee is already selected...
        if ( this.selectedEmployee && this.selectedEmployee.employeeId === parseInt(employeeId) )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the employee by id
        this._employeeService.getEmployeeById(employeeId)
            .subscribe((employee) => {

                // Set the selected leave
                this.selectedEmployee = employee;

                // Fill the form
                this.selectedEmployeeForm.patchValue(employee);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedEmployee = null;
    }


    /**
     * Create employee
     */
    createEmployee(): void
    {
        // Create the employee
        this._employeeService.createEmployee().subscribe((newEmployee) => {

            // Go to new employee
            this.selectedEmployee = newEmployee;

            // Fill the form
            this.selectedEmployeeForm.patchValue(newEmployee);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected employee using the form data
     */
    updateSelectedEmployee(): void
    {
        // Get the employee object
        const employee = this.selectedEmployeeForm.getRawValue();

        // Update the employee on the server
        this._employeeService.updateEmployee(employee).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected employee using the form data
     */
    deleteSelectedEmployee(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Employee',
            message: 'Are you sure you want to remove this employee? This action cannot be undone!',
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

                // Get the employee object
                const employee = this.selectedEmployeeForm.getRawValue();

                // Delete the employee on the server
                this._employeeService.deleteEmployee(employee.employeeId).subscribe(() => {

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
        return item.employeeId || index;
    }
}
