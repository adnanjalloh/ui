import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/employees'
    {path: '', pathMatch : 'full', redirectTo: 'employees'},

    // Admin routes
    {
        path       : '',
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            {path: 'employees', loadChildren: () => import('app/modules/admin/employee/employee.module').then(m => m.EmployeeModule)},
            {path: 'leaves', loadChildren: () => import('app/modules/admin/leave/leave.module').then(m => m.LeaveModule)},
            {path: 'expenses', loadChildren: () => import('app/modules/admin/expense/expense.module').then(m => m.ExpenseModule)},
            {path: 'expenses/details/:id', loadChildren: () => import('app/modules/admin/expense/details/expense-details.module').then(m => m.ExpenseDetailModule)},
        ]
    }
];
