import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface PaymentStatusResponse {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  getPaymentStatus(sessionId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${environment.apiUrl}/checkout/success`, {
      params: { sessionId }
    });
  }
}
