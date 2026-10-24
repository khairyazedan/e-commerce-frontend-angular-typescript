import { Routes } from "@angular/router";

export const ACCOUNT_ROUTES: Routes = [
    {
        path:'',
        loadComponent:()=> import('../../layout/account-layout/account-layout').then(m=>m.AccountLayout),
        children:[
            {path:'', pathMatch:'full', redirectTo:'profile'},
            {path:'profile', loadComponent: () => import('./profile/profile').then(m => m.Profile)},
            {path:'orders', loadComponent: () => import('./orders/orders').then(m => m.Orders)},
            {path:'addresses', loadComponent: () => import('./addresses/addresses').then(m => m.Addresses)},
            {path:'payment', loadComponent: () => import('./payment/payment').then(m => m.Payment)},
            {path:'settings', loadComponent: () => import('./settings/settings').then(m => m.Settings)},

        ]
    }  
]