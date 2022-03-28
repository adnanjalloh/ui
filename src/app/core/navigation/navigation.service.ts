import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, tap } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { defaultNavigation, horizontalNavigation } from './data';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { cloneDeep } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;
    
    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
         // Fill horizontal navigation children using the default navigation
         this._horizontalNavigation.forEach((horizontalNavItem) => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if ( defaultNavItem.id === horizontalNavItem.id )
                {
                    horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                }
            });
        });

        let response : Navigation = { 
            default   : cloneDeep(this._defaultNavigation),
            horizontal: cloneDeep(this._horizontalNavigation)
        }
        
        this._navigation.next(response);
        return of(response);
    }
}
