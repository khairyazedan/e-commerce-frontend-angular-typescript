import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes-guard';
import { adminGuardGuard } from './core/guards/admin-guard-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    // auth
    {
        path:'auth',
        canActivate:[guestGuard],
        loadChildren:()=> import('./features/auth/auth.routes').then(m=>m.AUTH_ROUTES)
    },
    {
        path:'account',
        canActivate:[authGuard],
        loadChildren:()=>import('./features/account/account.routes').then(m=>m.ACCOUNT_ROUTES)
    },
    {
        path:'admin',
        canActivate: [adminGuardGuard],
        loadChildren:()=> import("./features/admin/admin.routes").then(m=>m.ADMIN_ROUTES)
    },
    {
        path:'',
        loadChildren:()=> import('./features/shop/shop.routes').then(m=>m.SHOP_ROUTES)

    },
    {
        path:'**',
        loadChildren:()=> import("./shared/not-found/not-found").then(m=>m.NotFound)
    }
   
];
 