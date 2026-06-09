export interface CartMedicine {
  id: number;
  name: string;
  price: number;
  discount: number;
  stock: number;
  description: string;
  Images: { thumb_img: string }[];
}

export interface CartItem {
  medicine_id: number;
  quantity: number;
  Medicine: CartMedicine;
}
