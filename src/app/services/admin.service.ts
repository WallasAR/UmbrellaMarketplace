import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { UserProfile } from '../models/user.model';
import { Coupon } from './coupon.service';
import { Prescription } from './prescription.service';
import { PendingPharmacy } from './onboarding.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/dashboard`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/admin/orders`);
  }

  updateOrderStatus(sessionId: string, order_status: string) {
    return this.http.patch(`${environment.apiUrl}/admin/orders/${sessionId}/status`, { order_status });
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${environment.apiUrl}/admin/users`);
  }

  updateUserRole(userId: string, role: string) {
    return this.http.patch(`${environment.apiUrl}/admin/users/${userId}/role`, { role });
  }

  createProduct(product: Partial<Product>) {
    return this.http.post(`${environment.apiUrl}/admin/products`, product);
  }

  updateProduct(id: number, product: Partial<Product>) {
    return this.http.put(`${environment.apiUrl}/admin/products/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${environment.apiUrl}/admin/products/${id}`);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${environment.apiUrl}/admin/coupons`);
  }

  createCoupon(coupon: Partial<Coupon>) {
    return this.http.post(`${environment.apiUrl}/admin/coupons`, coupon);
  }

  getPendingPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${environment.apiUrl}/prescriptions/pending`);
  }

  getPendingPharmacies(): Observable<PendingPharmacy[]> {
    return this.http.get<PendingPharmacy[]>(`${environment.apiUrl}/admin/pharmacies/pending`);
  }

  approvePharmacy(id: string) {
    return this.http.patch(`${environment.apiUrl}/admin/pharmacies/${id}/approve`, {});
  }

  rejectPharmacy(id: string, reason: string) {
    return this.http.patch(`${environment.apiUrl}/admin/pharmacies/${id}/reject`, { reason });
  }

  getFinancial(period = '30d'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/financial`, { params: { period } });
  }

  getMetrics(period = '30d'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/metrics`, { params: { period } });
  }

  exportFinancial(period = '30d'): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/admin/financial/export`, {
      params: { period },
      responseType: 'blob'
    });
  }

  getPharmacyKyc(pharmacyId: string) {
    return this.http.get<{ pharmacy: any; documents: any[] }>(`${environment.apiUrl}/admin/pharmacies/${pharmacyId}/kyc`);
  }

  reviewKycDocument(id: string, status: 'approved' | 'rejected', notes?: string) {
    return this.http.patch(`${environment.apiUrl}/admin/kyc/${id}/review`, { status, notes });
  }

  getAuditLogs(limit = 50, entityType?: string) {
    let params: Record<string, string> = { limit: String(limit) };
    if (entityType) params['entity_type'] = entityType;
    return this.http.get<AuditLogEntry[]>(`${environment.apiUrl}/admin/audit-logs`, { params });
  }

  getBanners() {
    return this.http.get<InstitutionalBanner[]>(`${environment.apiUrl}/admin/banners`);
  }

  createBanner(payload: Partial<InstitutionalBanner>) {
    return this.http.post<InstitutionalBanner>(`${environment.apiUrl}/admin/banners`, payload);
  }

  updateBanner(id: string, payload: Partial<InstitutionalBanner>) {
    return this.http.patch<InstitutionalBanner>(`${environment.apiUrl}/admin/banners/${id}`, payload);
  }

  deleteBanner(id: string) {
    return this.http.delete(`${environment.apiUrl}/admin/banners/${id}`);
  }
}

export interface InstitutionalBanner {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  sponsor?: string;
  gradient?: string;
  priority?: number;
  active?: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload?: Record<string, unknown>;
  created_at: string;
  User?: { email?: string; name?: string };
}
