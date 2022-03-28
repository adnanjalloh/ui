import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'employee',
    templateUrl    : './employee.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
