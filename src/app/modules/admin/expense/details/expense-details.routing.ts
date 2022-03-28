import { Route } from '@angular/router';
import { ExpenseDetailsListComponent } from '../details/list/expense-details-list.component';
import { ExpenseDetailsResolver } from '../expense.resolvers';

export const expenseDetailsRoutes: Route[] = [
    {
        path     : '',
        component: ExpenseDetailsListComponent,
        resolve  : {
            expenseDetails: ExpenseDetailsResolver
        }
    }
];
