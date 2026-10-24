// pages/admin/products/admin-products.ts  (template: admin-products.html in the same folder)
// Admin products list. Like the storefront list, the filters live in the URL:
//   /admin/products?search=tee&status=draft&category=<id>&gender=men&fit=slim&minPrice=500&inStock=true&sort=price-asc&page=2
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of, startWith, switchMap } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductsService } from '../../../../core/services/products.service';
import {
  Fit,
  Gender,
  ICategoryRef,
  IPaginatedResponse,
  IProduct,
  IProductInput,
  IProductQuery,
  ProductSort,
  ProductStatus,
} from '../../../../core/models/product.model';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; res: IPaginatedResponse<IProduct> };

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];
const GENDERS: Gender[] = ['men', 'women', 'unisex', 'kids', 'boys', 'girls'];
const FITS: Fit[] = ['slim', 'regular', 'relaxed', 'oversized'];
const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A-Z' },
];

const PAGE_SIZE = 10;
const LOW_STOCK = 5;

const parseOne = <T extends string>(raw: string | null, allowed: readonly T[]): T | undefined =>
  allowed.find((a) => a === raw);

const parseNumber = (raw: string | null): number | undefined => {
  const n = Number(raw);
  return raw && Number.isFinite(n) && n >= 0 ? n : undefined;
};

const messageOf = (e: unknown) =>
  (e as HttpErrorResponse).error?.message ?? 'Something went wrong. Please try again.';


@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-products-list',
  styleUrl: './products-list.css',
  templateUrl: './products-list.html',
})

export class ProductsList{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsService);
  private readonly categoriesApi = inject(CategoryService);

  // template lookups
  protected readonly statusOptions = STATUSES;
  protected readonly genderOptions = GENDERS;
  protected readonly fitOptions = FITS;
  protected readonly sortOptions = SORTS;
  protected readonly lowStock = LOW_STOCK;
  protected readonly placeholders = [1, 2, 3, 4, 5];

  protected readonly categories = toSignal(
    this.categoriesApi.getAll().pipe(catchError(() => of([] as ICategoryRef[]))),
    { initialValue: [] as ICategoryRef[] },
  );

  /* ------------------------------------------------------- filters (from the URL) */

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly query = computed<IProductQuery>(() => {
    const p: ParamMap = this.params();
    return {
      page: Math.max(1, Math.floor(parseNumber(p.get('page')) ?? 1)),
      limit: PAGE_SIZE,
      sort: SORTS.find((s) => s.value === p.get('sort'))?.value,
      search: p.get('search')?.trim() || undefined,
      category: p.get('category') || undefined,
      status: parseOne(p.get('status'), STATUSES.map((s) => s.value)),
      gender: parseOne(p.get('gender'), GENDERS),
      fit: parseOne(p.get('fit'), FITS),
      minPrice: parseNumber(p.get('minPrice')),
      maxPrice: parseNumber(p.get('maxPrice')),
      inStock: p.get('inStock') === 'true' || undefined,
    };
  });

  protected readonly moreFiltersCount = computed(() => {
    const q = this.query();
    return [q.gender, q.fit, q.minPrice, q.maxPrice, q.inStock].filter((v) => v !== undefined).length;
  });

  protected readonly hasFilters = computed(() => {
    const q = this.query();
    return !!(q.search || q.category || q.status) || this.moreFiltersCount() > 0;
  });

  /* ------------------------------------------------------------------ loading */

  private readonly reload = signal(0);

  private readonly state = toSignal(
    toObservable(computed(() => ({ query: this.query(), reload: this.reload() }))).pipe(
      switchMap(({ query }) =>
        this.api.getAdminProducts(query).pipe(
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

  protected readonly pages = computed(() => {
    const m = this.meta();
    if (!m || m.totalPages <= 1) return [];
    const start = Math.max(1, Math.min(m.page - 2, m.totalPages - 4));
    const end = Math.min(m.totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  /* ---------------------------------------------------------- changing filters */

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

  // for the <select> filters: empty value removes the filter
  protected onSelect(key: 'category' | 'status' | 'gender' | 'fit' | 'sort', event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.setParams({ [key]: value && !(key === 'sort' && value === 'newest') ? value : null });
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
    this.setParams({
      search: null, category: null, status: null, gender: null, fit: null,
      minPrice: null, maxPrice: null, inStock: null,
    });
  }

  protected retry() {
    this.reload.update((n) => n + 1);
  }

  /* ------------------------------------------------------------------- actions */

  protected readonly busyId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly toDelete = signal<IProduct | null>(null);

  // the trash button opens the Bootstrap modal (data attributes) and calls this to remember the product
  protected askDelete(p: IProduct) {
    this.toDelete.set(p);
  }

  // the server archives the product, it is not erased
  protected async confirmDelete() {
    const p = this.toDelete();
    if (!p) return;
    this.busyId.set(p._id);
    this.actionError.set(null);
    try {
      await firstValueFrom(this.api.deleteProduct(p._id));
      this.retry();
    } catch (e) {
      this.actionError.set(messageOf(e));
    } finally {
      this.busyId.set(null);
      this.toDelete.set(null);
    }
  }

  protected async restore(p: IProduct) {
    this.busyId.set(p._id);
    this.actionError.set(null);
    try {
      await firstValueFrom(this.api.updateProduct(p._id, { status: 'draft', isAvailable: true }));
      this.retry();
    } catch (e) {
      this.actionError.set(messageOf(e));
    } finally {
      this.busyId.set(null);
    }
  }

  // creates a draft copy (the server makes a new unique slug) and opens it for editing
  protected async duplicate(p: IProduct) {
    this.busyId.set(p._id);
    this.actionError.set(null);

    const body: IProductInput = {
      name: `${p.name} (copy)`.slice(0, 150),
      description: p.description,
      category: p.category._id,
      price: p.price,
      stockQuantity: 0,
      status: 'draft',
      isAvailable: p.isAvailable,
      isFeatured: false,
      galleryImages: p.galleryImages ?? [],
      ...(p.brand && { brand: p.brand }),
      ...(p.subCategory && { subCategory: p.subCategory }),
      ...(p.gender && { gender: p.gender }),
      ...(p.fit && { fit: p.fit }),
      ...(p.material && { material: p.material }),
      ...(p.careInstructions && { careInstructions: p.careInstructions }),
      ...(p.featuredImageUrl && { featuredImageUrl: p.featuredImageUrl }),
      ...(p.sizeChartImage && { sizeChartImage: p.sizeChartImage }),
      ...(p.seo && {
        seo: { metaTitle: p.seo.metaTitle, metaDescription: p.seo.metaDescription, keywords: p.seo.keywords ?? [] },
      }),
    };

    try {
      const res = await firstValueFrom(this.api.createProduct(body));
      await this.router.navigate(['/admin/products', res.data._id, 'edit']);
    } catch (e) {
      this.actionError.set(messageOf(e));
    } finally {
      this.busyId.set(null);
    }
  }
}