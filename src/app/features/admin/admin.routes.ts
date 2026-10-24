import { Routes } from "@angular/router";
import { unsavedChangesGuard } from "../../core/guards/unsaved-changes-guard";

export const ADMIN_ROUTES: Routes = [
    {
        path:'',
        loadComponent:()=> import('../../layout/admin-layout/admin-layout').then(c=>c.AdminLayout),
        children:[
            {path:'', pathMatch:'full', redirectTo:'overview'},
            {path:'overview', loadComponent:()=>import("./overview/overview").then(m=>m.Overview)},
            {path:'analytics', loadComponent:()=>import("./analytics/analytics").then(m=>m.Analytics)},
            {
                path: 'products',
                children: [
                  { path: '', title: 'Products', data: { subtitle: 'Manage your product catalog and availability' },
                    loadComponent: () => import('./products/products-list/products-list').then(m => m.ProductsList) },
                  { path: 'new',
                    canDeactivate: [unsavedChangesGuard],
                    loadComponent: () => import('./products/products-form/products-form').then(m => m.ProductsForm) },
                  { path: ':id/edit', title: 'Edit product',
                    canDeactivate: [unsavedChangesGuard],
                    // resolve: { product: productResolver },
                    loadComponent: () => import('./products/products-form/products-form').then(m => m.ProductsForm) },
                ],
              },
              {
                path:'categories',
                children:[
                  {
                    path: "",
                    loadComponent:()=> import("./categories/categories").then(m=>m.Categories)
                  },
                  {
                    path: "new",
                    loadComponent:()=> import("./categories/category-form/category-form").then(m=>m.CategoryForm)
                  }
                  

                ]
                

              }
              ,
              {
                path:'profile',
                loadComponent:()=> import("./profile/profile").then(m=>m.Profile)

              },

              {
                path: 'orders',
                children: [
                  { path: '', title: 'Orders',
                    loadComponent: () => import('./orders/orders-list/orders-list').then(m => m.OrdersList) },
                  { path: ':id',
                    // resolve: { order: orderResolver },
                    loadComponent: () => import('./orders/orders-details/orders-details').then(m => m.OrdersDetails) },
                ],
              },

              {
                path: 'customers',
                
                children: [
                  { path: '', title: 'Customers',
                    loadComponent: () => import('./customers/customer-list/customer-list').then(m => m.CustomerList) },
                  { path: ':id',
                    // resolve: { customer: customerResolver },
                    loadComponent: () => import('./customers/customer-detail/customer-detail').then(m => m.CustomerDetail) },
                ],
              },

              {
                path: 'settings',
                loadComponent: () => import('./settings/settings').then(m => m.Settings),  // sidebar tabs + <router-outlet/>
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'store' },
                  { path: 'store', loadComponent: () => import('./settings/store-info/store-info').then(m => m.StoreInfo) },
                  { path: 'payments', loadComponent: () => import('./settings/payments/payments').then(m => m.Payments) },
                  { path: 'shipping', loadComponent: () => import('./settings/shipping/shipping').then(m => m.Shipping) },
                  { path: 'taxes', loadComponent: () => import('./settings/taxes/taxes').then(m => m.Taxes) },
                  { path: 'team', loadComponent: () => import('./settings/team-members/team-members').then(m => m.TeamMembers) },
                  { path: 'notifications',loadComponent: () => import('./settings/notifications/notifications').then(m => m.Notifications) },
                ],
              },  

            {path:'reviews', loadComponent:()=>import("./reviews/reviews").then(m=>m.Reviews)},
            {path:'inventory', loadComponent:()=>import("./inventory/inventory").then(m=>m.Inventory)},
        ]
    }
]