import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
  IPaginatedResponse,
  IProduct, 
  IProductInput,
  IProductMutationResponse,
  IProductQuery,
  IProductResponse,
  IProductUpdate,
} from '../models/product.model';

@Service()
export class ProductsService {
  private _http = inject(HttpClient);
  private _apiURL = environment.apiURL + 'products';


  getProducts(query: IProductQuery = {}): Observable<IPaginatedResponse<IProduct>> {
    return this._http.get<IPaginatedResponse<IProduct>>(this._apiURL, { params: this.toParams(query) });
  }

  getProduct(idOrSlug: string): Observable<IProductResponse> {
    return this._http.get<IProductResponse>(`${this._apiURL}/${encodeURIComponent(idOrSlug)}`);
  }


  getAdminProducts(query: IProductQuery = {}): Observable<IPaginatedResponse<IProduct>> {
    return this._http.get<IPaginatedResponse<IProduct>>(`${this._apiURL}/admin-products`, {
      params: this.toParams(query),
    });
  }

  getAdminProduct(id: string): Observable<IProductResponse> {
    return this._http.get<IProductResponse>(`${this._apiURL}/admin-products/${id}`);
  }

  createProduct(body: IProductInput): Observable<IProductMutationResponse> {
    return this._http.post<IProductMutationResponse>(`${this._apiURL}/add-product`, body);
  }

  updateProduct(id: string, body: IProductUpdate): Observable<IProductMutationResponse> {
    return this._http.patch<IProductMutationResponse>(`${this._apiURL}/${id}`, body);
  }

  deleteProduct(id: string): Observable<IProductMutationResponse> {
    return this._http.delete<IProductMutationResponse>(`${this._apiURL}/${id}`);
  }


  private toParams(query: IProductQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '' || value === false) continue;
      params = params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    return params;
  }
}