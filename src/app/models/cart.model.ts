export interface CartPharmacy {
  id: string;
  name: string;
}

export interface CartMedicine {
  id: number;
  name: string;
  price: number;
  discount: number;
  stock: number;
  description: string;
  pharmacy_id?: string;
  requires_prescription?: boolean;
  Images: { thumb_img: string }[];
  Pharmacy?: CartPharmacy;
}

export interface CartItem {
  medicine_id: number;
  quantity: number;
  Medicine: CartMedicine;
}

export interface CartPharmacyGroup {
  pharmacyId: string;
  pharmacyName: string;
  items: CartItem[];
  subtotal: number;
}
