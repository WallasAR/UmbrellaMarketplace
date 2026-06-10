import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DeliveryQuote {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address?: string;
  price: number;
  eta_minutes: number;
  distance_km?: number;
  courier: string;
}

export interface DeliveryTracking {
  id: string;
  status: string;
  quoted_price: number;
  eta_minutes?: number;
  destination_address?: string;
  Pharmacy?: { name: string; address?: string; phone?: string };
}

export interface PickupOrder {
  id: string;
  pickup_code: string;
  status: string;
  expires_at: string;
  Pharmacy?: { name: string; address?: string; phone?: string };
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor(private http: HttpClient) {}

  quote(payload: {
    pharmacy_ids: string[];
    destination_lat: number;
    destination_lng: number;
    courier?: 'local' | 'uber';
  }): Observable<DeliveryQuote[]> {
    return this.http.post<DeliveryQuote[]>(`${environment.apiUrl}/delivery/quote`, payload);
  }

  track(purchaseId: string): Observable<DeliveryTracking> {
    return this.http.get<DeliveryTracking>(`${environment.apiUrl}/delivery/track/${purchaseId}`);
  }

  getPickup(purchaseId: string): Observable<PickupOrder> {
    return this.http.get<PickupOrder>(`${environment.apiUrl}/pickup/${purchaseId}`);
  }
}
