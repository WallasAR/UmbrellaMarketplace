import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { Prescription } from './prescription.service';

export interface PharmacyDashboard {
  pharmacy: { id: string; name: string; operational_status: string; plan_tier: string; owner_user_id?: string };
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
  active_ingredient?: string;
  laboratory?: string;
  medicine_type?: 'reference' | 'generic';
  dosage?: string;
}

export interface ConnectStatus {
  connected: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  onboarding_status: string;
}

export interface KycDocument {
  id: string;
  document_type: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
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

export interface PharmacyDelivery {
  id: string;
  purchase_id: string;
  status: string;
  quoted_price: number;
  eta_minutes?: number;
  destination_address?: string;
  courier?: string;
  User?: { name?: string; email?: string };
}

export interface PriceBenchmark {
  product: { id: number; name: string; my_price: number };
  market_average: number;
  market_cheapest: number;
  position: 'cheapest' | 'competitive' | 'above_market';
  competitors: Array<{
    medicine_id: number;
    pharmacy_name?: string;
    final_price: number;
    is_mine: boolean;
  }>;
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

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  getMetrics(period = '30d'): Observable<any> {
    return this.http.get(`${this.base}/metrics`, { params: { period } });
  }

  exportFinancial(period = '30d'): Observable<Blob> {
    return this.http.get(`${this.base}/financial/export`, {
      params: { period },
      responseType: 'blob'
    });
  }

  listPendingPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.base}/prescriptions/pending`);
  }

  reviewPrescription(id: string, status: 'approved' | 'rejected', notes?: string): Observable<Prescription> {
    return this.http.patch<Prescription>(`${this.base}/prescriptions/${id}/review`, { status, notes });
  }

  getConnectStatus(): Observable<ConnectStatus> {
    return this.http.get<ConnectStatus>(`${this.base}/connect/status`);
  }

  startConnectOnboarding(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.base}/connect/onboard`, {});
  }

  listKycDocuments(): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.base}/kyc/documents`);
  }

  getDeliveries(): Observable<PharmacyDelivery[]> {
    return this.http.get<PharmacyDelivery[]>(`${this.base}/deliveries`);
  }

  advanceDelivery(id: string): Observable<PharmacyDelivery> {
    return this.http.post<PharmacyDelivery>(`${this.base}/deliveries/${id}/advance`, {});
  }

  confirmPickup(pickupCode: string): Observable<unknown> {
    return this.http.post(`${this.base}/pickup/confirm`, { pickup_code: pickupCode });
  }

  getPriceBenchmark(productId: number): Observable<PriceBenchmark> {
    return this.http.get<PriceBenchmark>(`${this.base}/products/${productId}/price-benchmark`);
  }

  getPriceHistory(productId: number, period = '90d'): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/products/${productId}/price-history`, {
      params: { period }
    });
  }

  uploadKycDocument(documentType: string, file: File): Observable<KycDocument> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.http.post<KycDocument>(`${this.base}/kyc/documents`, {
          document_type: documentType,
          file_name: file.name,
          file_data: base64
        }).subscribe(observer);
      };
      reader.onerror = () => observer.error(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
