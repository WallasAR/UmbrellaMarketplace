export interface PharmacyRef {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  Images: [{
    thumb_img: string;
    primary_img?: string;
    secondary_img?: string;
    tertiary_img?: string;
  }];
  discount: number;
  stock: number;
  description: string;
  category?: string;
  requires_prescription?: boolean;
  active_ingredient?: string;
  laboratory?: string;
  pharmacy_id?: string;
  Pharmacy?: PharmacyRef;
  allows_subscription?: boolean;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  pharmacyId?: string;
  sort?: 'price_asc' | 'price_desc' | 'discount_desc' | 'name_asc';
  discount?: boolean;
  stock?: boolean;
}
