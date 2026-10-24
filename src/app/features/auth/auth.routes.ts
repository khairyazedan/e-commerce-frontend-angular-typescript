import { Routes } from "@angular/router";
import { unsavedChangesGuard } from "../../core/guards/unsaved-changes-guard";

export const AUTH_ROUTES:Routes = [
    { 
        path: '',
        canDeactivate:[unsavedChangesGuard],
        loadComponent: ()=> import("../../layout/auth-layout/auth-layout").then(m => m.AuthLayout),
        children : [
            { path: '', pathMatch: 'full', redirectTo: 'login' },
            {path: 'login', loadComponent:()=> import("./login/login").then(m => m.Login)},
            {path: 'signup', loadComponent:()=>import('./signup/signup').then(m=> m.Signup)}
        ]
    }
]  