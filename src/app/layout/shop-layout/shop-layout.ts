import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreNavbar } from '../../features/shop/shared/components/store-navbar/store-navbar';
import { StoreFooter } from '../../features/shop/shared/components/store-footer/store-footer';

@Component({
  imports: [RouterOutlet, StoreNavbar, StoreFooter],
  selector: 'app-shop-layout',
  styleUrl: './shop-layout.css',
  templateUrl: './shop-layout.html',
})
export class ShopLayout {}
 