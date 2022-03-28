import { Route } from '@angular/router';
import { LeaveComponent } from './leave.component';
import { AllEmployeesResolver, LeaveResolver, LeaveTypesResolver } from './leave.resolvers';
import { LeaveListComponent } from './list/leave-list.component';

export const leaveRoutes: Route[] = [
    {
        path     : '',
        component: LeaveComponent,
        children : [
            {
                path     : '',
                component: LeaveListComponent,
                resolve  : {
                    leaveTypes    : LeaveTypesResolver,
                    employees: AllEmployeesResolver,
                    leaves: LeaveResolver
                }
            }
        ]
    }
];
