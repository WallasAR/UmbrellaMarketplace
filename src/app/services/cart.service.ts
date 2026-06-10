import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CartItem, CartPharmacyGroup } from '../models/cart.model';
import { environment } from '../../environments/environment';

export interface PharmacyCheckoutSession {
  pharmacyId: string;
  pharmacyName: string;
  url: string;
  items: number;
}

export interface CheckoutResponse {
  mode: 'single' | 'multi';
  url?: string;
  sessions?: PharmacyCheckoutSession[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  data = signal<CartItem[]>([]);
  itemCount = computed(() => this.data().reduce((sum, item) => sum + item.quantity, 0));
  subtotal = computed(() =>
    this.data().reduce((sum, item) => sum + this.getItemPrice(item) * item.quantity, 0)
  );

  groupedByPharmacy = computed<CartPharmacyGroup[]>(() => {
    const groups = new Map<string, CartPharmacyGroup>();

    for (const item of this.data()) {
      const pharmacyId = item.Medicine?.pharmacy_id || 'unknown';
      const pharmacyName = item.Medicine?.Pharmacy?.name || 'Farmácia';

      if (!groups.has(pharmacyId)) {
        groups.set(pharmacyId, { pharmacyId, pharmacyName, items: [], subtotal: 0 });
      }

      const group = groups.get(pharmacyId)!;
      group.items.push(item);
      group.subtotal += this.getItemPrice(item) * item.quantity;
    }

    return Array.from(groups.values());
  });

  prescriptionRequiredItems = computed(() =>
    this.data().filter((item) => item.Medicine?.requires_prescription)
  );

  constructor(private http: HttpClient) {}

  loadCart(): void {
    this.http.get<CartItem[]>(`${environment.apiUrl}/cart/list`).subscribe({
      next: (items) => this.data.set(items ?? []),
      error: () => this.data.set([])
    });
  }

  addItem(medicineId: number, quantity: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/cart/add`, {
      medicine_id: medicineId,
      quantity
    }).pipe(tap(() => this.loadCart()));
  }

  updateQuantity(medicineId: number, delta: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/cart/update`, {
      medicine_id: medicineId,
      quantity: delta
    }).pipe(tap(() => this.loadCart()));
  }

  removeItem(medicineId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/cart/delete/${medicineId}`).pipe(
      tap(() => this.loadCart())
    );
  }

  checkoutCart(couponCode?: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${environment.apiUrl}/checkout/cart`, { couponCode });
  }

  checkoutItem(medicineId: number, quantity: number, couponCode?: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${environment.apiUrl}/checkout/item/${medicineId}`, { quantity, couponCode });
  }

  getItemPrice(item: CartItem): number {
    const price = item.Medicine?.price ?? 0;
    const discount = item.Medicine?.discount ?? 0;
    return discount ? price * (1 - discount / 100) : price;
  }
}
