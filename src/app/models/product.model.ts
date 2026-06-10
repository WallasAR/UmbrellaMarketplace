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
  medicine_type?: 'reference' | 'generic';
  dosage?: string;
}

export interface ProductAlternative {
  id: number;
  name: string;
  price: number;
  discount: number;
  final_price: number;
  medicine_type?: 'reference' | 'generic';
  laboratory?: string;
  Pharmacy?: PharmacyRef;
  Images: Product['Images'];
}

export interface ProductAlternativesResponse {
  product: Product & { final_price: number };
  alternatives: ProductAlternative[];
  cheapest: ProductAlternative | null;
  cheapest_generic: ProductAlternative | null;
  savings_percent: number;
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
