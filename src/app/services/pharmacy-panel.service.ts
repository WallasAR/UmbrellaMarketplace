import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

export interface PharmacyDashboard {
  pharmacy: { id: string; name: string; operational_status: string; plan_tier: string };
  productCount: number;
  batchCount: number;
  orderCount: number;
  revenue: number;
  lowStockCount: number;
  expiringSoonCount: number;
}

export interface PharmacyProduct {
  id: number;
  name: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  description?: string;
  requires_prescription: boolean;
  allows_subscription: boolean;
}

export interface MedicineBatch {
  id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  medicine_id: number;
  Medicine?: { id: number; name: string };
}

export interface PharmacyAlerts {
  lowStock: { id: number; name: string; stock: number }[];
  expiringBatches: MedicineBatch[];
  staffNotified: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacyPanelService {
  private readonly base = `${environment.apiUrl}/pharmacy`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<PharmacyDashboard> {
    return this.http.get<PharmacyDashboard>(`${this.base}/dashboard`);
  }

  getProducts(): Observable<PharmacyProduct[]> {
    return this.http.get<PharmacyProduct[]>(`${this.base}/products`);
  }

  getBatches(): Observable<MedicineBatch[]> {
    return this.http.get<MedicineBatch[]>(`${this.base}/batches`);
  }

  createBatch(payload: {
    medicine_id: number;
    batch_number: string;
    quantity: number;
    expiry_date: string;
  }): Observable<MedicineBatch> {
    return this.http.post<MedicineBatch>(`${this.base}/batches`, payload);
  }

  updateBatch(id: string, payload: Partial<MedicineBatch>): Observable<MedicineBatch> {
    return this.http.put<MedicineBatch>(`${this.base}/batches/${id}`, payload);
  }

  deleteBatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/batches/${id}`);
  }

  getAlerts(): Observable<PharmacyAlerts> {
    return this.http.get<PharmacyAlerts>(`${this.base}/alerts`);
  }

  scanAlerts(): Observable<PharmacyAlerts> {
    return this.http.post<PharmacyAlerts>(`${this.base}/alerts/scan`, {});
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  updateOrderStatus(sessionId: string, order_status: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/orders/${sessionId}/status`, { order_status });
  }

  updateOperationalStatus(operational_status: string): Observable<unknown> {
    return this.http.patch(`${this.base}/status`, { operational_status });
  }

  getFinancial(period = '30d'): Observable<any> {
    return this.http.get(`${this.base}/financial`, { params: { period } });
  }

  getBilling(): Observable<any> {
    return this.http.get(`${this.base}/billing`);
  }

  checkoutPlan(plan_tier: string): Observable<{ mode: string; url?: string; activated?: boolean }> {
    return this.http.post<{ mode: string; url?: string; activated?: boolean }>(`${this.base}/billing/checkout`, { plan_tier });
  }

  openBillingPortal(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.base}/billing/portal`, {});
  }

  createProduct(payload: Partial<PharmacyProduct> & { name: string; price: number }): Observable<PharmacyProduct> {
    return this.http.post<PharmacyProduct>(`${this.base}/products`, payload);
  }

  updateProduct(id: number, payload: Partial<PharmacyProduct>): Observable<PharmacyProduct> {
    return this.http.put<PharmacyProduct>(`${this.base}/products/${id}`, payload);
  }

  exportFinancial(period = '30d'): Observable<Blob> {
    return this.http.get(`${this.base}/financial/export`, {
      params: { period },
      responseType: 'blob'
    });
  }
}
