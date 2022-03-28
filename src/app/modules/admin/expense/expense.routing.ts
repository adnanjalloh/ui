import { Route } from '@angular/router';
import { ExpenseComponent } from './expense.component';
import { AllEmployeesResolver, ExpensesResolver } from './expense.resolvers';
import { ExpenseListComponent } from './list/expense-list.component';

export const expenseRoutes: Route[] = [
    {
        path     : '',
        component: ExpenseComponent,
        children : [
            {
                path     : '',
                component: ExpenseListComponent,
                resolve  : {
                    employees: AllEmployeesResolver,
                    expenses: ExpensesResolver
                }
            }
        ]
    }
];
