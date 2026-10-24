// pages/admin/categories/categories.ts  (template: categories.html in the same folder)
// Admin categories list. Filters live in the URL: /admin/categories?search=den&status=inactive
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of, startWith, switchMap } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryStatus, IAdminCategoryQuery, ICategory } from '../../../core/models/category.model';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: ICategory[] };

interface Row {
  category: ICategory;
  depth: number; // 0 = top level, 1 = subcategory, ...
}

// Puts each subcategory right under its parent. A category whose parent is not in the list
// (for example because of a search) is shown as a top-level row.
const flatten = (list: ICategory[]): Row[] => {
  const ids = new Set(list.map((c) => c._id));
  const parentOf = (c: ICategory) =>
    typeof c.parentCategory === 'string' ? c.parentCategory : (c.parentCategory?._id ?? null);

  const kids = new Map<string, ICategory[]>();
  const roots: ICategory[] = [];
  for (const c of list) {
    const pid = parentOf(c);
    if (pid && ids.has(pid)) kids.set(pid, [...(kids.get(pid) ?? []), c]);
    else roots.push(c);
  }

  const rows: Row[] = [];
  const seen = new Set<string>();
  const walk = (c: ICategory, depth: number) => {
    if (seen.has(c._id)) return;
    seen.add(c._id);
    rows.push({ category: c, depth });
    (kids.get(c._id) ?? []).forEach((k) => walk(k, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));
  list.forEach((c) => walk(c, 0)); // safety net: anything left over (a parent loop) still shows
  return rows;
};

@Component({
  imports: [RouterLink],
  selector: 'app-categories',
  styleUrl: './categories.css',
  templateUrl: './categories.html',
})
export class Categories {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CategoryService);

  protected readonly placeholders = [1, 2, 3, 4];

  /* ------------------------------------------------------- filters (from the URL) */

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly query = computed<IAdminCategoryQuery>(() => {
    const p = this.params();
    const status = p.get('status');
    return {
      search: p.get('search')?.trim() || undefined,
      status: status === 'active' || status === 'inactive' ? status : undefined,
    };
  });

  protected readonly hasFilters = computed(() => !!(this.query().search || this.query().status));

  /* ------------------------------------------------------------------ loading */

  private readonly reload = signal(0);

  private readonly state = toSignal(
    toObservable(computed(() => ({ query: this.query(), reload: this.reload() }))).pipe(
      switchMap(({ query }) =>
        this.api.getAdminCategories(query).pipe(
          map((items): State => ({ status: 'ready', items })),
          catchError(() => of<State>({ status: 'error' })),
          startWith<State>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected readonly isLoading = computed(() => this.state().status === 'loading');
  protected readonly hasError = computed(() => this.state().status === 'error');

  protected readonly rows = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? flatten(s.items) : [];
  });

  protected readonly total = computed(() => this.rows().length);
  protected readonly visibleCount = computed(() => this.rows().filter((r) => r.category.status === 'active').length);

  /* ---------------------------------------------------------- changing filters */

  protected setParams(changes: Record<string, string | null>) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: changes,
      queryParamsHandling: 'merge',
    });
  }

  protected onSearch(value: string) {
    this.setParams({ search: value.trim() || null });
  }

  protected onStatus(event: Event) {
    this.setParams({ status: (event.target as HTMLSelectElement).value || null });
  }

  protected clearFilters() {
    this.setParams({ search: null, status: null });
  }

  protected retry() {
    this.reload.update((n) => n + 1);
  }

  /* ------------------------------------------------------------------- actions */

  protected readonly busyId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected parentName(c: ICategory): string | null {
    return c.parentCategory && typeof c.parentCategory === 'object' ? c.parentCategory.name : null;
  }

  // There is no DELETE route, so "hide" sets the category to inactive (and "show" sets it back to active).
  protected async toggleStatus(c: ICategory) {
    const next: CategoryStatus = c.status === 'active' ? 'inactive' : 'active';
    this.busyId.set(c._id);
    this.actionError.set(null);
    try {
      await firstValueFrom(this.api.setStatus(c._id, next));
      this.retry();
    } catch (e) {
      this.actionError.set(
        (e as HttpErrorResponse).error?.message ?? 'Could not update the category. Please try again.',
      );
    } finally {
      this.busyId.set(null);
    }
  }
}