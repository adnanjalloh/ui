import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Pagination } from 'app/shared/shared.types';
import { EmployeeService } from '../../employee/employee.service';
import { GetAllEmployeeResponseDto } from '../../employee/employee.types';
import { SearchExpenseClaimResponseDto, UpdateExpenseResponseDto } from '../expense.types';
import { ExpenseService } from '../expense.service';

@Component({
    selector       : 'expense-list',
    templateUrl    : './expense-list.component.html',
    styles         : [
        /* language=SCSS */
        `
            .expense-grid {
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
export class ExpenseListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    expenses$: Observable<SearchExpenseClaimResponseDto[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: Pagination;
    selectedExpense: UpdateExpenseResponseDto | null = null;
    selectedExpenseForm: FormGroup;
    employees: GetAllEmployeeResponseDto[];
    searchEmployeeControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _expenseService: ExpenseService,
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
        this.searchEmployeeControl.setValue('0');

        // Create the selected expense form
        this.selectedExpenseForm = this._formBuilder.group({
            expenseClaimId                  : [''],
            employeeId                      : ['', [Validators.required]],
            description                     : [''],
            total                           : [''],
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
        this._expenseService.pagination$
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
                    return this._expenseService.getExpenses(0, 10, query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

            // Get the expenses
            this.expenses$ = this._expenseService._expenses$; 
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

            // Get expenses if page changes
            merge(this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._expenseService.getExpenses(this._paginator.pageIndex, this._paginator.pageSize, this.searchEmployeeControl.value);
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
     * Toggle expense details
     *
     * @param expenseId
     */
    toggleDetails(expenseId: string): void
    {
        // If the expense is already selected...
        if ( this.selectedExpense && this.selectedExpense.expenseClaimId === parseInt(expenseId) )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the expense by id
        this._expenseService.getExpenseById(expenseId)
            .subscribe((expense) => {

                // Set the selected expense
                this.selectedExpense = expense;

                // Fill the form
                this.selectedExpenseForm.patchValue(expense);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedExpense = null;
    }


    /**
     * Create expense
     */
    createExpense(): void
    {
        // Create the expense
        this._expenseService.createExpense().subscribe((newexpense) => {

            // Go to new expense
            this.selectedExpense = newexpense;

            // Fill the form
            this.selectedExpenseForm.patchValue(newexpense);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected expense using the form data
     */
    updateSelectedExpense(): void
    {
        // Get the expense object
        const expense = this.selectedExpenseForm.getRawValue();

        // Update the expense on the server
        this._expenseService.updateExpense(expense).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected expense using the form data
     */
    deleteSelectedExpense(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Expense',
            message: 'Are you sure you want to remove this expense? This action cannot be undone!',
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

                // Get the expense object
                const expense = this.selectedExpenseForm.getRawValue();

                // Delete the expense on the server
                this._expenseService.deleteExpense(expense.expenseClaimId).subscribe(() => {

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
        return item.expenseClaimId || index;
    }
}
