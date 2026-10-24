import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
  CategoryStatus,
  IAdminCategoryQuery,
  ICategory,
  ICategoryInput,
  ICategoryListResponse,
  ICategoryMutationResponse,
  ICategoryRef,
  ICategoryResponse,
  ICategoryUpdate,
} from '../models/category.model';

@Service()
export class CategoryService {
  private _http = inject(HttpClient);
  private _apiURL = environment.apiURL + 'categories';

  getCategories(): Observable<ICategory[]> {
    return this._http.get<ICategoryListResponse>(this._apiURL).pipe(map((res) => res.data));
  }

  getAll(): Observable<ICategoryRef[]> {
    return this.getCategories();
  }

  getCategory(idOrSlug: string): Observable<ICategoryResponse> {
    return this._http.get<ICategoryResponse>(`${this._apiURL}/${encodeURIComponent(idOrSlug)}`);
  }

  getAdminCategories(query: IAdminCategoryQuery = {}): Observable<ICategory[]> {
    return this._http
      .get<ICategoryListResponse>(`${this._apiURL}/admin`, { params: this.toParams(query) })
      .pipe(map((res) => res.data));
  }

  getAdminCategory(id: string): Observable<ICategoryResponse> {
    return this._http.get<ICategoryResponse>(`${this._apiURL}/admin/${id}`);
  }

  createCategory(body: ICategoryInput): Observable<ICategoryMutationResponse> {
    return this._http.post<ICategoryMutationResponse>(this._apiURL, body);
  }

  updateCategory(id: string, body: ICategoryUpdate): Observable<ICategoryMutationResponse> {
    return this._http.patch<ICategoryMutationResponse>(`${this._apiURL}/${id}`, body);
  }

  setStatus(id: string, status: CategoryStatus): Observable<ICategoryMutationResponse> {
    return this.updateCategory(id, { status });
  }


  private toParams(query: IAdminCategoryQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }
}