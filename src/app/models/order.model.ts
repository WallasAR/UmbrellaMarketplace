export interface OrderItem {
  medicine_id: number;
  quantity: number;
  total_price: number;
  Medicine?: {
    id: number;
    name: string;
    Images?: { thumb_img: string }[];
  };
}

export interface Order {
  sessionId: string;
  payment_status: string;
  order_status: string;
  payment_method?: string;
  created_at?: string;
  total_price: number;
  items: OrderItem[];
}
