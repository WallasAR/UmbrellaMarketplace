import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SaasPlan {
  id: string;
  tier: string;
  name: string;
  monthly_price: number;
  commission_rate: number;
  max_products: number | null;
}

export interface OnboardingStatus {
  status: string;
  pharmacy?: {
    id: string;
    name: string;
    onboarding_status: string;
    plan_tier: string;
    rejected_reason?: string;
  };
  role?: string;
}

export interface PendingPharmacy {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  plan_tier: string;
  created_at: string;
  owner?: { email: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly base = `${environment.apiUrl}/onboarding`;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<SaasPlan[]> {
    return this.http.get<SaasPlan[]>(`${this.base}/plans`);
  }

  getStatus(): Observable<OnboardingStatus> {
    return this.http.get<OnboardingStatus>(`${this.base}/status`);
  }

  register(payload: {
    name: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    cep: string;
    phone: string;
    plan_tier: string;
    latitude?: number;
    longitude?: number;
  }): Observable<unknown> {
    return this.http.post(`${this.base}/register`, payload);
  }
}
