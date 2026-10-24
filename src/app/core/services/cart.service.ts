import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { AuthService } from './auth.service';
import { GuestCartService, MAX_PER_ITEM } from './guest-cart.service';
import { Cart, CartItem, CartResponse } from '../models/cart.model';
import { ICartLine, IGuestCartItem } from '../models/cartItem.model';
 
const API = environment.apiURL + 'cart'; 
 
const serverLine = (i: CartItem): ICartLine => ({
  productId: i.product._id,
  name: i.product.name,
  price: i.price,
  imageUrl: i.product.featuredImageUrl,
  slug: i.product.slug,
  quantity: i.quantity,
  maxQuantity: Math.max(1, Math.min(MAX_PER_ITEM, i.product.stockQuantity)),
});
 
const guestLine = (i: IGuestCartItem): ICartLine => ({ ...i, maxQuantity: MAX_PER_ITEM });
 
@Service()
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly guest = inject(GuestCartService);
 
  private readonly _server = signal<Cart | null>(null);
  private readonly _notices = signal<string[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
 
  // true once AuthService has a decoded token (after login, or after checkIfLoggedIn / refresh on page load)
  private readonly user = toSignal(this.auth.getUserData(), { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.user());
 
  readonly notices = this._notices.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
 
  readonly items = computed<ICartLine[]>(() =>
    this.isLoggedIn()
      ? (this._server()?.items ?? []).filter((i) => !!i.product).map(serverLine)
      : this.guest.items().map(guestLine),
  );
  readonly count = computed(() => this.items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));
  readonly isEmpty = computed(() => this.items().length === 0);
 
  constructor() {
    // runs on page load (already logged in) and right after a login
    effect(() => {
      const loggedIn = this.isLoggedIn();
      untracked(() => {
        if (loggedIn) void this.mergeGuestCart();
        else {
          this._server.set(null);
          this._notices.set([]);
        }
      });
    });
  }
 
  /* ----------------------------------------------------------------- actions */
 
  async refresh(): Promise<boolean> {
    if (!this.isLoggedIn()) return true;
    return this.call(this.http.get<CartResponse>(API));
  }
 
  async add(product: Omit<IGuestCartItem, 'quantity'>, quantity = 1): Promise<boolean> {
    if (!this.isLoggedIn()) {
      this.guest.add(product, quantity);
      return true;
    }
    return this.call(
      this.http.post<CartResponse>(`${API}/items`, { productId: product.productId, quantity }),
    );
  }
 
  async setQuantity(productId: string, quantity: number): Promise<boolean> {
    if (!this.isLoggedIn()) {
      this.guest.setQuantity(productId, quantity);
      return true;
    }
    if (quantity < 1) return this.remove(productId);
    return this.call(this.http.patch<CartResponse>(`${API}/items/${productId}`, { quantity }));
  }
 
  async remove(productId: string): Promise<boolean> {
    if (!this.isLoggedIn()) {
      this.guest.remove(productId);
      return true;
    }
    return this.call(this.http.delete<CartResponse>(`${API}/items/${productId}`));
  }
 
  async clear(): Promise<boolean> {
    if (!this.isLoggedIn()) {
      this.guest.clear();
      return true;
    }
    return this.call(this.http.delete<CartResponse>(API));
  }
 
  /** Sends the localStorage items to the server one by one (in order, so only one cart is created). */
  async mergeGuestCart(): Promise<void> {
    const local = this.guest.items();
    const skipped: string[] = [];
 
    for (const item of local) {
      // the interceptor logs the user out when a refresh fails: stop, and keep the local cart for next time
      if (!this.isLoggedIn()) return;
      try {
        await firstValueFrom(
          this.http.post<CartResponse>(`${API}/items`, {
            productId: item.productId,
            quantity: item.quantity,
          }),
        );
      } catch {
        if (!this.isLoggedIn()) return; // session ended during the merge
        skipped.push(item.name); // out of stock, hidden, or over the limit
      }
    }
 
    this.guest.clear();
    await this.refresh();
    if (skipped.length) {
      this._notices.update((n) => [...n, `Could not add to your cart: ${skipped.join(', ')}`]);
    }
  }
 
  /* ----------------------------------------------------------------- helpers */
 
  private async call(request: Observable<CartResponse>): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(request);
      this._server.set(res.data);
      this._notices.set(res.meta?.notices ?? []);
      return true;
    } catch (e) {
      const err = e as HttpErrorResponse;
      // a 401 here means the interceptor could not refresh the token (it also redirects to /auth/login)
      this._error.set(
        err.status === 401
          ? 'Your session expired. Please log in again.'
          : (err.error?.message ?? 'Something went wrong. Please try again.'),
      );
      return false;
    } finally {
      this._loading.set(false);
    }
  }
}
 