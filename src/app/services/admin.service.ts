import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { UserProfile } from '../models/user.model';
import { Coupon } from './coupon.service';
import { Prescription } from './prescription.service';

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
}
