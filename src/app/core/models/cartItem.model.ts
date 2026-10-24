
export interface IGuestCartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  quantity: number;
}


export interface ICartLine {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  quantity: number;
  maxQuantity: number; 
}