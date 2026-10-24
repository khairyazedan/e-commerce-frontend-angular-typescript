// pages/admin/product-form/product-form.ts  (template: product-form.html in the same folder)
// One form for both routes:
//   /admin/products/new          -> add
//   /admin/products/:id/edit     -> edit  (loads the product and fills the form)
// Images are uploaded to ImageKit straight from the browser; the form stores the returned URLs.
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';
import { ImagekitService } from '../../../../core/services/image-kit.service';
import { ProductsService } from '../../../../core/services/products.service';
import { Fit, Gender, ICategoryRef, IProductInput, ProductStatus } from '../../../../core/models/product.model';

type ImageSlot = 'featured' | 'gallery' | 'sizeChart';

const MAX_GALLERY = 10;            // same limit as the backend validation
const MAX_FILE_BYTES = 5 * 1024 * 1024;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-products-form',
  styleUrl: './products-form.css',
  templateUrl: './products-form.html',
})

export class ProductsForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsService);
  private readonly imagekit = inject(ImagekitService);
  private readonly categoriesApi = inject(CategoryService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = !!this.id;
  protected readonly maxGallery = MAX_GALLERY;

  protected readonly categories = toSignal(
    this.categoriesApi.getAll().pipe(catchError(() => of([] as ICategoryRef[]))),
    { initialValue: [] as ICategoryRef[] },
  );

  /* ----------------------------------------------------------------------- form */

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['', [Validators.required]],
    brand: [''],
    gender: ['' as Gender | ''],
    category: ['', [Validators.required]],
    subCategory: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    fit: ['' as Fit | ''],
    material: [''],
    careInstructions: [''],
    metaTitle: ['', [Validators.maxLength(70)]],
    metaDescription: ['', [Validators.maxLength(160)]],
    keywords: [''],
    status: ['draft' as ProductStatus],
    isAvailable: [true],
    isFeatured: [false],
  });
  protected readonly f = this.form.controls;

  // image URLs live in signals (they come from ImageKit, not from inputs)
  protected readonly featuredImageUrl = signal('');
  protected readonly galleryImages = signal<string[]>([]);
  protected readonly sizeChartImage = signal('');

  protected readonly uploading = signal<ImageSlot | null>(null);
  protected readonly imageError = signal<string | null>(null);

  protected readonly loading = signal(this.isEdit);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    if (this.id) void this.load(this.id);
  }

  private async load(id: string) {
    try {
      const { data: p } = await firstValueFrom(this.api.getAdminProduct(id));
      this.form.patchValue({
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand ?? '',
        gender: p.gender ?? '',
        category: p.category?._id ?? '',
        subCategory: p.subCategory ?? '',
        price: p.price,
        stockQuantity: p.stockQuantity,
        fit: p.fit ?? '',
        material: p.material ?? '',
        careInstructions: p.careInstructions ?? '',
        metaTitle: p.seo?.metaTitle ?? '',
        metaDescription: p.seo?.metaDescription ?? '',
        keywords: (p.seo?.keywords ?? []).join(', '),
        status: p.status,
        isAvailable: p.isAvailable,
        isFeatured: p.isFeatured,
      });
      this.featuredImageUrl.set(p.featuredImageUrl ?? '');
      this.galleryImages.set(p.galleryImages ?? []);
      this.sizeChartImage.set(p.sizeChartImage ?? '');
    } catch (e) {
      this.loadError.set(this.messageOf(e, 'Could not load this product.'));
    } finally {
      this.loading.set(false);
    }
  }

  /* --------------------------------------------------------------------- images */

  protected async onFeatured(event: Event) {
    const files = this.pickFiles(event).slice(0, 1);
    const [url] = await this.uploadFiles('featured', files);
    if (url) this.featuredImageUrl.set(url);
  }

  protected async onSizeChart(event: Event) {
    const files = this.pickFiles(event).slice(0, 1);
    const [url] = await this.uploadFiles('sizeChart', files);
    if (url) this.sizeChartImage.set(url);
  }

  protected async onGallery(event: Event) {
    const room = MAX_GALLERY - this.galleryImages().length;
    const files = this.pickFiles(event).slice(0, Math.max(0, room));
    const urls = await this.uploadFiles('gallery', files);
    if (urls.length) this.galleryImages.update((g) => [...g, ...urls]);
  }

  // Removing only drops the URL from the product. The file stays in your ImageKit library.
  protected removeFeatured() {
    this.featuredImageUrl.set('');
  }
  protected removeSizeChart() {
    this.sizeChartImage.set('');
  }
  protected removeGallery(index: number) {
    this.galleryImages.update((g) => g.filter((_, i) => i !== index));
  }

  private pickFiles(event: Event): File[] {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // lets the same file be picked again
    return files;
  }

  private async uploadFiles(slot: ImageSlot, files: File[]): Promise<string[]> {
    if (!files.length) return [];
    this.imageError.set(null);

    const bad = files.find((file) => !file.type.startsWith('image/') || file.size > MAX_FILE_BYTES);
    if (bad) {
      this.imageError.set(`${bad.name}: only image files up to 5 MB are allowed.`);
      return [];
    }

    this.uploading.set(slot);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await this.imagekit.uploadImage(file));
      return urls.filter(Boolean);
    } catch {
      this.imageError.set('Image upload failed. Please try again.');
      return [];
    } finally {
      this.uploading.set(null);
    }
  }

  /* --------------------------------------------------------------------- submit */

  protected async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.uploading()) return;

    this.saving.set(true);
    this.submitError.set(null);
    try {
      const body = this.buildBody();
      if (this.id) await firstValueFrom(this.api.updateProduct(this.id, body));
      else await firstValueFrom(this.api.createProduct(body));
      await this.router.navigate(['/admin/products']);
    } catch (e) {
      this.submitError.set(this.messageOf(e, 'Could not save the product. Please try again.'));
    } finally {
      this.saving.set(false);
    }
  }

  // Empty optional URLs and selects are left out because the backend validation rejects empty strings for them.
  private buildBody(): IProductInput {
    const v = this.form.getRawValue();
    const keywords = v.keywords.split(',').map((k) => k.trim()).filter(Boolean);

    return {
      name: v.name.trim(),
      description: v.description.trim(),
      category: v.category,
      price: Number(v.price),
      stockQuantity: Number(v.stockQuantity),
      status: v.status,
      isAvailable: v.isAvailable,
      isFeatured: v.isFeatured,
      brand: v.brand.trim(),
      subCategory: v.subCategory.trim(),
      material: v.material.trim(),
      careInstructions: v.careInstructions.trim(),
      galleryImages: this.galleryImages(),
      seo: { metaTitle: v.metaTitle.trim(), metaDescription: v.metaDescription.trim(), keywords },
      ...(v.slug.trim() && { slug: v.slug.trim() }),
      ...(v.gender && { gender: v.gender }),
      ...(v.fit && { fit: v.fit }),
      ...(this.featuredImageUrl() && { featuredImageUrl: this.featuredImageUrl() }),
      ...(this.sizeChartImage() && { sizeChartImage: this.sizeChartImage() }),
    };
  }

  private messageOf(e: unknown, fallback: string) {
    return (e as HttpErrorResponse).error?.message ?? fallback;
  }
}