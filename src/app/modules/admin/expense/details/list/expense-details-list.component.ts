import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Pagination } from 'app/shared/shared.types';
import { GetClaimDetailsResponseDto, UpdateExpenseDetailResponseDto, UpdateExpenseResponseDto } from '../../expense.types';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../expense.service';

@Component({
    selector       : 'expense-details-list',
    templateUrl    : './expense-details-list.component.html',
    styles         : [
        /* language=SCSS */
        `
            .expense-details-grid {
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
export class ExpenseDetailsListComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    expenseDetails$: Observable<GetClaimDetailsResponseDto[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: Pagination;
    selectedExpenseDetail: UpdateExpenseDetailResponseDto | null = null;
    selectedExpenseDetailForm: FormGroup;
    currentClaimId: string;
    descriptionClaim:string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _expenseService: ExpenseService
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
      
        //get claim Id from route params and set it to currentClaimId
        this.currentClaimId = this._route.snapshot.paramMap.get('id'); 

        // Create the selected expense detail form
        this.selectedExpenseDetailForm = this._formBuilder.group({
            expenseClaimDetailId            : [''],
            expenseClaimId                  : this.currentClaimId,
            description                     : [''],
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

        // get description from claim
         this._expenseService.getExpenseTilte(parseInt(this.currentClaimId)).subscribe({
            next: (claimTitle: string) => {
                this.descriptionClaim = claimTitle;
            }
        });

        // Get the expenses
        this.expenseDetails$ = this._expenseService._expenseDetails$; 

           
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

            // Get expense details if page changes
            merge(this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._expenseService.getExpenseDetails(this._paginator.pageIndex, this._paginator.pageSize, parseInt(this.currentClaimId));
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
     * @param expenseDetailId
     */
    toggleDetails(expenseDetailId: string): void
    {
        // If the expense detail is already selected...
        if ( this.selectedExpenseDetail && this.selectedExpenseDetail.expenseClaimDetailId === parseInt(expenseDetailId) )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the expense detail by id
        this._expenseService.getExpenseDetailById(expenseDetailId)
            .subscribe((expenseDetail) => {

                // Set the selected expense detail
                this.selectedExpenseDetail = expenseDetail;

                // Fill the form
                this.selectedExpenseDetailForm.patchValue(expenseDetail);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedExpenseDetail = null;
    }


    /**
     * Create expense detail
     */
    createExpenseDetail(): void
    {
        // Create the expense detail
        this._expenseService.createExpenseDetail().subscribe((newExpenseDetail) => {

            // Go to new expense  detail  
            this.selectedExpenseDetail = newExpenseDetail;

            // Fill the form
            this.selectedExpenseDetailForm.patchValue(newExpenseDetail);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected expense detail using the form data
     */
    updateSelectedExpenseDetail(): void
    {
        // Get the expense detail object
        const expenseDetail = this.selectedExpenseDetailForm.getRawValue();

        // Update the expense detail on the server
        this._expenseService.updateExpenseDetail(expenseDetail).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected expense detail using the form data
     */
    deleteSelectedExpenseDetail(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete Detail',
            message: 'Are you sure you want to remove this expense detail? This action cannot be undone!',
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
                const expenseDetail = this.selectedExpenseDetailForm.getRawValue();

                // Delete the expense on the server
                this._expenseService.deleteExpenseDetail(expenseDetail.expenseClaimDetailId).subscribe(() => {

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
        return item.expenseClaimDetailId || index;
    }
}
