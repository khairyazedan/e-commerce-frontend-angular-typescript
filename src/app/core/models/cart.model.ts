
export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  featuredImageUrl?: string;
  stockQuantity: number;
  status: 'draft' | 'active' | 'archived';
  isAvailable: boolean;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;            
  user?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subTotal: number;
  grandTotal: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartMeta {
  itemCount: number;
  notices: string[];       
  sessionId?: string;      
}

export interface CartResponse {
  message?: string;
  data: Cart;
  meta: CartMeta;
}


export interface AddCartItemBody {
  productId: string;
  quantity?: number;      
}

export interface UpdateCartItemBody {
  quantity: number;        
}