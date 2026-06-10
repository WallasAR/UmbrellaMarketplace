import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface CopilotResponse {
  session_id?: string;
  reply: string;
  intent: string;
  symptom?: string;
  products: Product[];
  parsed_lines?: string[];
}

export interface CopilotSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: { products?: Array<{ id: number; name: string }> };
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CopilotService {
  constructor(private http: HttpClient) {}

  listSessions(): Observable<CopilotSession[]> {
    return this.http.get<CopilotSession[]>(`${environment.apiUrl}/copilot/sessions`);
  }

  getSessionMessages(sessionId: string): Observable<CopilotMessage[]> {
    return this.http.get<CopilotMessage[]>(`${environment.apiUrl}/copilot/sessions/${sessionId}/messages`);
  }

  chat(message: string, sessionId?: string): Observable<CopilotResponse> {
    return this.http.post<CopilotResponse>(`${environment.apiUrl}/copilot/chat`, {
      message,
      session_id: sessionId
    });
  }

  scanPrescription(payload: {
    text?: string;
    file_data?: string;
    session_id?: string;
  }): Observable<CopilotResponse> {
    return this.http.post<CopilotResponse>(`${environment.apiUrl}/copilot/prescription-scan`, payload);
  }

  prescriptionToCart(payload: {
    text?: string;
    file_data?: string;
    items?: Array<{ medicine_id: number; quantity?: number }>;
  }): Observable<{ message: string; cart: { added: number; updated: number } }> {
    return this.http.post<{ message: string; cart: { added: number; updated: number } }>(
      `${environment.apiUrl}/copilot/prescription-to-cart`,
      payload
    );
  }

  getCartInsights(): Observable<CartInsights> {
    return this.http.get<CartInsights>(`${environment.apiUrl}/copilot/cart-insights`);
  }
}

export interface CartInsightProduct {
  id: number;
  name: string;
  price: number;
}

export interface CartInsights {
  item_count: number;
  interactions: Array<{ severity: string; message: string; matched_ingredients?: string[] }>;
  cross_sell: Array<{ message: string; products: CartInsightProduct[] }>;
}
