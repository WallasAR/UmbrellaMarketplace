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

export interface OrderDelivery {
  id: string;
  status: string;
  quoted_price: number;
  eta_minutes?: number;
}

export interface OrderPickup {
  pickup_code: string;
  status: string;
  expires_at: string;
}

export interface Order {
  sessionId: string;
  payment_status: string;
  order_status: string;
  payment_method?: string;
  fulfillment_mode?: 'delivery' | 'pickup';
  delivery_fee?: number;
  created_at?: string;
  total_price: number;
  items: OrderItem[];
  delivery?: OrderDelivery;
  pickup?: OrderPickup;
}
