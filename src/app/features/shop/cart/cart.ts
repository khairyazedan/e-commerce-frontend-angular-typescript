// pages/cart/cart.ts  (template: cart.html in the same folder)
import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ICartLine } from '../../../core/models/cartItem.model';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
})
export class Cart {
  protected readonly cart = inject(CartService);

  constructor() {
    void this.cart.refresh(); // loads the server cart when logged in; guests need nothing
  }

  protected increase(line: ICartLine) {
    if (line.quantity < line.maxQuantity) void this.cart.setQuantity(line.productId, line.quantity + 1);
  }

  protected decrease(line: ICartLine) {
    if (line.quantity > 1) void this.cart.setQuantity(line.productId, line.quantity - 1);
  }

  protected onQuantityInput(line: ICartLine, event: Event) {
    const input = event.target as HTMLInputElement;
    const typed = Math.floor(Number(input.value));
    const quantity = Number.isFinite(typed) ? Math.min(line.maxQuantity, Math.max(1, typed)) : line.quantity;

    input.value = String(quantity); // snap the box back if the number was out of range
    if (quantity !== line.quantity) void this.cart.setQuantity(line.productId, quantity);
  }

  protected remove(line: ICartLine) {
    void this.cart.remove(line.productId);
  }

  protected clear() {
    void this.cart.clear();
  }
}