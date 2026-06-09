import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  constructor(private http: HttpClient) {}

  validate(code: string, subtotal: number): Observable<Coupon> {
    return this.http.post<Coupon>(`${environment.apiUrl}/coupons/validate`, { code, subtotal });
  }
}
