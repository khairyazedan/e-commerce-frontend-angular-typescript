// pages/admin/category-form/category-form.ts  (template: category-form.html in the same folder)
// One form for both routes:
//   /admin/categories/new          -> add
//   /admin/categories/:id/edit     -> edit  (loads the category and fills the form)
// The image is uploaded to ImageKit from the browser; the form stores the returned URL.
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';
import { ImagekitService } from '../../../../core/services/image-kit.service';
import { CategoryStatus, ICategory, ICategoryInput } from '../../../../core/models/category.model';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-category-form',
  styleUrl: './category-form.css',
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CategoryService);
  private readonly imagekit = inject(ImagekitService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = !!this.id;

  /* ----------------------------------------------------------------------- form */

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    slug: ['', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['', [Validators.maxLength(500)]],
    parentCategory: [''],
    status: ['active' as CategoryStatus],
  });
  protected readonly f = this.form.controls;

  protected readonly imageUrl = signal('');
  protected readonly uploading = signal(false);
  protected readonly imageError = signal<string | null>(null);

  protected readonly loading = signal(this.isEdit);
  protected readonly loadError = signal<string | null>(null);
  protected readonly loaded = signal<ICategory | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);

  /* ---------------------------------------------------------- parent category list */

  // every category, hidden ones too, so an old category can keep a hidden parent
  protected readonly categories = toSignal(
    this.api.getAdminCategories().pipe(catchError(() => of([] as ICategory[]))),
    { initialValue: [] as ICategory[] },
  );

  // When editing, the category itself and all of its subcategories cannot be its parent.
  private readonly excluded = computed(() => {
    const out = new Set<string>(this.id ? [this.id] : []);
    const parentOf = (c: ICategory) =>
      typeof c.parentCategory === 'string' ? c.parentCategory : (c.parentCategory?._id ?? null);

    let grew = this.id !== null;
    while (grew) {
      grew = false;
      for (const c of this.categories()) {
        const p = parentOf(c);
        if (p && out.has(p) && !out.has(c._id)) {
          out.add(c._id);
          grew = true;
        }
      }
    }
    return out;
  });

  protected readonly parentOptions = computed(() =>
    this.categories().filter((c) => !this.excluded().has(c._id)),
  );

  constructor() {
    if (this.id) void this.load(this.id);
  }

  private async load(id: string) {
    try {
      const { data: c } = await firstValueFrom(this.api.getAdminCategory(id));
      this.loaded.set(c);
      this.form.patchValue({
        name: c.name,
        slug: c.slug,
        description: c.description ?? '',
        parentCategory: typeof c.parentCategory === 'string' ? c.parentCategory : (c.parentCategory?._id ?? ''),
        status: c.status,
      });
      this.imageUrl.set(c.imageUrl ?? '');
    } catch (e) {
      this.loadError.set(this.messageOf(e, 'Could not load this category.'));
    } finally {
      this.loading.set(false);
    }
  }

  /* --------------------------------------------------------------------- image */

  protected async onImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the same file be picked again
    if (!file) return;

    this.imageError.set(null);
    if (!file.type.startsWith('image/') || file.size > MAX_FILE_BYTES) {
      this.imageError.set(`${file.name}: only image files up to 5 MB are allowed.`);
      return;
    }

    this.uploading.set(true);
    try {
      const url = await this.imagekit.uploadImage(file);
      if (url) this.imageUrl.set(url);
    } catch {
      this.imageError.set('Image upload failed. Please try again.');
    } finally {
      this.uploading.set(false);
    }
  }

  // Only drops the URL from the form. The file stays in your ImageKit library.
  protected removeImage() {
    this.imageUrl.set('');
  }

  /* --------------------------------------------------------------------- submit */

  protected async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.uploading()) return;

    this.saving.set(true);
    this.submitError.set(null);
    try {
      const body = this.buildBody();
      if (this.id) await firstValueFrom(this.api.updateCategory(this.id, body));
      else await firstValueFrom(this.api.createCategory(body));
      await this.router.navigate(['/admin/categories']);
    } catch (e) {
      this.submitError.set(this.messageOf(e, 'Could not save the category. Please try again.'));
    } finally {
      this.saving.set(false);
    }
  }

  private buildBody(): ICategoryInput {
    const v = this.form.getRawValue();
    const description = v.description.trim();

    return {
      name: v.name.trim(),
      status: v.status,
      ...(v.slug.trim() && { slug: v.slug.trim() }),
      ...(this.imageUrl() && { imageUrl: this.imageUrl() }),
      // edit: always send the description and parent so they can be cleared; add: only when filled in
      ...(this.isEdit || description ? { description } : {}),
      ...(v.parentCategory
        ? { parentCategory: v.parentCategory }
        : this.isEdit
          ? { parentCategory: null }
          : {}),
    };
  }

  private messageOf(e: unknown, fallback: string) {
    return (e as HttpErrorResponse).error?.message ?? fallback;
  }
}