

export type Gender = 'men' | 'women' | 'unisex' | 'kids' | 'boys' | 'girls';
export type Fit = 'slim' | 'oversized' | 'relaxed' | 'regular';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type ProductSort = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name';


export interface ICategoryRef {
  _id: string;
  name: string; 
  slug: string;
}

export interface IProductSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  category: ICategoryRef;
  subCategory?: string;
  price: number;
  featuredImageUrl?: string;
  galleryImages: string[];
  stockQuantity: number;
  seo?: IProductSeo;
  status: ProductStatus;
  isFeatured: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  gender?: Gender;
  material?: string;
  careInstructions?: string;
  fit?: Fit;
  sizeChartImage?: string;
  createdAt: string;
  updatedAt: string;
  inStock?: boolean; 
}


export type IProductRaw = Omit<IProduct, 'category'> & { category: string };

/* ------------------------------------------------------------- list query */

export interface IProductQuery {
  page?: number;
  limit?: number;             
  sort?: ProductSort;         
  search?: string;            
  category?: string;          
  gender?: Gender | Gender[];
  fit?: Fit | Fit[];
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  status?: ProductStatus;     
}



export interface IPaginatedResponse<T> {
  message: string;
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  data: T[];
}

export interface IProductResponse {
  data: IProduct;
}

export interface IProductMutationResponse {
  message: string;
  data: IProductRaw;
}


export interface IProductInput {
  name: string;                 
  slug?: string;                
  description: string;
  brand?: string;
  category: string;            
  subCategory?: string;
  price: number;               
  featuredImageUrl?: string;
  galleryImages?: string[];     
  stockQuantity?: number;      
  seo?: {
    metaTitle?: string;         
    metaDescription?: string;   
    keywords?: string[];        
  };
  status?: ProductStatus;
  isFeatured?: boolean;
  isAvailable?: boolean;
  gender?: Gender;
  material?: string;
  careInstructions?: string;
  fit?: Fit;
  sizeChartImage?: string;
}


export type IProductUpdate = Partial<IProductInput>;