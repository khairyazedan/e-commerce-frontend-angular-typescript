import { ICategoryRef, IPaginatedResponse } from './product.model';

export type { ICategoryRef, IPaginatedResponse };

export type CategoryStatus = 'active' | 'inactive';

export interface ICategoryChild extends ICategoryRef {
  imageUrl?: string;
}

export interface ICategory extends ICategoryRef {
  description?: string;
  imageUrl?: string;
  parentCategory: string | ICategoryRef | null;
  status: CategoryStatus;
  children?: ICategoryChild[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminCategoryQuery {
  status?: CategoryStatus;
  search?: string;
}

export interface ICategoryListResponse {
  message?: string;
  data: ICategory[];
}

export interface ICategoryResponse {
  data: ICategory;
}

export interface ICategoryMutationResponse {
  message: string;
  data: ICategory;
}

export interface ICategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: string | null;
  status?: CategoryStatus;
}

export type ICategoryUpdate = Partial<ICategoryInput>;