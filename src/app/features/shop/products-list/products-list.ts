// pages/product-list/product-list.ts  (template: product-list.html in the same folder)
// Storefront product list. The URL is the single source of truth for the filters, so every
// filtered page can be bookmarked, shared, and works with the browser back button:
//   /products?search=tee&gender=men,unisex&fit=oversized&minPrice=500&maxPrice=2000&inStock=true&sort=price-asc&page=2
//   /products?category=<categoryId>      (link your home-page category tiles here)
import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { ProductsService } from '../../../core/services/products.service';
import {
  Fit,
  Gender,
  IPaginatedResponse,
  IProduct,
  IProductQuery,
  ProductSort,
} from '../../../core/models/product.model';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; res: IPaginatedResponse<IProduct> };

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
];
const FITS: { value: Fit; label: string }[] = [
  { value: 'slim', label: 'Slim' },
  { value: 'regular', label: 'Regular' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'oversized', label: 'Oversized' },
];
const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A-Z' },
];

const PAGE_SIZE = 12;
const LOW_STOCK = 5;

// "men,unisex" -> ['men','unisex'], dropping anything that is not an allowed value
const parseList = <T extends string>(raw: string | null, allowed: { value: T }[]): T[] =>
  (raw ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is T => allowed.some((a) => a.value === v));

const parseNumber = (raw: string | null): number | undefined => {
  const n = Number(raw);
  return raw && Number.isFinite(n) && n >= 0 ? n : undefined;
};
@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-products-list', 
  styleUrl: './products-list.css',
  templateUrl: './products-list.html',
})

export class ProductsList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductsService);
  protected readonly cart = inject(CartService);

  // template lookups
  protected readonly genderOptions = GENDERS;
  protected readonly fitOptions = FITS;
  protected readonly sortOptions = SORTS;
  protected readonly lowStock = LOW_STOCK;
  protected readonly placeholders = [1, 2, 3, 4, 5, 6];

  /* ------------------------------------------------------- filters (from the URL) */

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly genders = computed(() => parseList(this.params().get('gender'), GENDERS));
  protected readonly fits = computed(() => parseList(this.params().get('fit'), FITS));

  protected readonly query = computed<IProductQuery>(() => {
    const p: ParamMap = this.params();
    const sort = SORTS.find((s) => s.value === p.get('sort'))?.value;
    return {
      page: Math.max(1, Math.floor(parseNumber(p.get('page')) ?? 1)),
      limit: PAGE_SIZE,
      sort,
      search: p.get('search')?.trim() || undefined,
      category: p.get('category') || undefined,
      gender: this.genders().length ? this.genders() : undefined,
      fit: this.fits().length ? this.fits() : undefined,
      minPrice: parseNumber(p.get('minPrice')),
      maxPrice: parseNumber(p.get('maxPrice')),
      inStock: p.get('inStock') === 'true' || undefined,
    };
  });

  protected readonly hasFilters = computed(() => {
    const q = this.query();
    return !!(q.search || q.gender || q.fit || q.minPrice !== undefined || q.maxPrice !== undefined || q.inStock);
  });

  /* ------------------------------------------------------------------ loading */

  private readonly reload = signal(0);

  private readonly state = toSignal(
    toObservable(computed(() => ({ query: this.query(), reload: this.reload() }))).pipe(
      switchMap(({ query }) =>
        this.products.getProducts(query).pipe(
          map((res): State => ({ status: 'ready', res })),
          catchError(() => of<State>({ status: 'error' })),
          startWith<State>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected readonly isLoading = computed(() => this.state().status === 'loading');
  protected readonly hasError = computed(() => this.state().status === 'error');

  protected readonly items = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.res.data : [];
  });

  protected readonly meta = computed(() => {
    const s = this.state();
    return s.status === 'ready'
      ? { page: s.res.page, limit: s.res.limit, totalPages: s.res.totalPages, total: s.res.totalResults }
      : null;
  });

  protected readonly range = computed(() => {
    const m = this.meta();
    return m && m.total ? { from: (m.page - 1) * m.limit + 1, to: Math.min(m.page * m.limit, m.total) } : null;
  });

  // up to 5 page numbers around the current page
  protected readonly pages = computed(() => {
    const m = this.meta();
    if (!m || m.totalPages <= 1) return [];
    const start = Math.max(1, Math.min(m.page - 2, m.totalPages - 4));
    const end = Math.min(m.totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  /* ---------------------------------------------------------- changing filters */

  // Writes the filters to the URL. A null value removes that param. Any filter change goes back to page 1.
  protected setParams(changes: Record<string, string | number | null>) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...changes, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected onSearch(value: string) {
    this.setParams({ search: value.trim() || null });
  }

  protected onSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.setParams({ sort: value === 'newest' ? null : value });
  }

  protected toggle(key: 'gender' | 'fit', value: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current: string[] = key === 'gender' ? this.genders() : this.fits();
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    this.setParams({ [key]: next.length ? next.join(',') : null });
  }

  protected onInStock(event: Event) {
    this.setParams({ inStock: (event.target as HTMLInputElement).checked ? 'true' : null });
  }

  protected applyPrice(min: string, max: string) {
    this.setParams({
      minPrice: parseNumber(min.trim() || null) ?? null,
      maxPrice: parseNumber(max.trim() || null) ?? null,
    });
  }

  protected clearFilters() {
    this.setParams({ search: null, gender: null, fit: null, minPrice: null, maxPrice: null, inStock: null });
  }

  protected removeValue(key: 'gender' | 'fit', value: string) {
    const current: string[] = key === 'gender' ? this.genders() : this.fits();
    const next = current.filter((v) => v !== value);
    this.setParams({ [key]: next.length ? next.join(',') : null });
  }

  protected retry() {
    this.reload.update((n) => n + 1);
  }

  /* ---------------------------------------------------------------- add to cart */

  protected readonly addedId = signal<string | null>(null);
  protected readonly addError = signal<string | null>(null);

  protected async addToCart(p: IProduct) {
    this.addError.set(null);
    const ok = await this.cart.add(
      { productId: p._id, name: p.name, price: p.price, imageUrl: p.featuredImageUrl, slug: p.slug },
      1,
    );
    if (!ok) return this.addError.set(this.cart.error());

    this.addedId.set(p._id);
    setTimeout(() => this.addedId.update((id) => (id === p._id ? null : id)), 1500);
  }
}