import { Route } from '@angular/router';
import { ExpenseDetailsListComponent } from '../details/list/expense-details-list.component';
import { ExpenseDetailsResolver, ExpenseDetailTitleResolver } from './expense-details.resolvers';

export const expenseDetailsRoutes: Route[] = [
    {
        path     : '',
        component: ExpenseDetailsListComponent,
        resolve  : {
            expenseDetails: ExpenseDetailsResolver,
            descriptionClaim: ExpenseDetailTitleResolver
        }
    }
];
