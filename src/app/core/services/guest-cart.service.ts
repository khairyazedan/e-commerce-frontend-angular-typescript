// services/guest-cart.service.ts
import { computed, effect, Service, signal } from '@angular/core';
import { IGuestCartItem } from '../models/cartItem.model';

const storageKey = 'ut_guest_cart';
export const MAX_PER_ITEM = 10; // same limit as the backend
const clamp = (q: number) => Math.min(MAX_PER_ITEM, Math.max(1, Math.floor(q)));

@Service()
export class GuestCartService {
  private _items = signal<IGuestCartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(this._items()));
      } catch {
        console.log('error saving cart items in local storage');
      }
    });
  }

  add(product: Omit<IGuestCartItem, 'quantity'>, quantity = 1) {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    this._items.update((items) => {
      const exists = items.some((i) => i.productId === product.productId);
      return exists
        ? items.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: clamp(i.quantity + quantity) }
              : i,
          )
        : [...items, { ...product, quantity: clamp(quantity) }];
    });
  }

  setQuantity(productId: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity) } : i)),
    );
  }

  remove(productId: string) {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear() {
    this._items.set([]);
  }

  private load(): IGuestCartItem[] {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      return Array.isArray(raw)
        ? raw.filter(
            (i) =>
              typeof i?.productId === 'string' &&
              typeof i?.price === 'number' &&
              Number.isInteger(i?.quantity) &&
              i.quantity > 0,
          )
        : [];
    } catch {
      return [];
    }
  }
}