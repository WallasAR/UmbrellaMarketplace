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
  tracking_url?: string;
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
  order_group_id?: string | null;
  created_at?: string;
  total_price: number;
  items: OrderItem[];
  delivery?: OrderDelivery;
  pickup?: OrderPickup;
}

export interface OrderGroup {
  id: string;
  status: string;
  created_at: string;
  total_price: number;
  session_count: number;
  sessions: Order[];
}
