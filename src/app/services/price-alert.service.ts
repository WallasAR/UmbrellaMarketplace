import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PriceAlert {
  id: string;
  medicine_id: number;
  target_price: number;
  active: boolean;
  triggered_at?: string;
  Medicine?: { id: number; name: string; price: number; discount: number };
}

@Injectable({ providedIn: 'root' })
export class PriceAlertService {
  constructor(private http: HttpClient) {}

  list(): Observable<PriceAlert[]> {
    return this.http.get<PriceAlert[]>(`${environment.apiUrl}/price-alerts`);
  }

  create(medicineId: number, targetPrice: number): Observable<PriceAlert> {
    return this.http.post<PriceAlert>(`${environment.apiUrl}/price-alerts`, {
      medicine_id: medicineId,
      target_price: targetPrice
    });
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/price-alerts/${id}`);
  }
}
