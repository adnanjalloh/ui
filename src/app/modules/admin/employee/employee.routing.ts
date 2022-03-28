import { Route } from '@angular/router';
import { EmployeeComponent } from './employee.component';
import { EmployeeListComponent } from './list/employee-list.component';
import { DepartmentsResolver, EmployeesResolver } from './employee.resolvers';

export const employeeRoutes: Route[] = [
    {
        path     : '',
        component: EmployeeComponent,
        children : [
            {
                path     : '',
                component: EmployeeListComponent,
                resolve  : {
                    departments    : DepartmentsResolver,
                    employees: EmployeesResolver,
                }
            }
        ]
    }
];
