import { Routes } from "@angular/router";

export const SHOP_ROUTES : Routes = [
    {
        path:'',
        loadComponent:()=> import('../../layout/shop-layout/shop-layout').then(m=> m.ShopLayout),
        children:[
            {
                path: '',
                loadComponent: ()=> import('./home/home').then(m=>m.Home)
            },
            {
                path: 'products',
                loadComponent:()=> import('./products-list/products-list').then(m=>m.ProductsList)
            },
            {
                path:"products/:slug",
                // resolve: { product: productResolver },
                loadComponent: ()=> import('./products-details/products-details').then(m=>m.ProductsDetails),
        
            },
            {
                path: 'cart',
                loadComponent:()=> import('./cart/cart').then(m=>m.Cart)
            },
            {
                path:'checkout',
                // canActivate: [authGuard],
                loadComponent:()=> import('./check-out/check-out').then(m=>m.CheckOut)
            }
        ]
    }
]