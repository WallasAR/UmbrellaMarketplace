import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface CopilotResponse {
  reply: string;
  intent: string;
  symptom?: string;
  products: Product[];
  parsed_lines?: string[];
}

@Injectable({ providedIn: 'root' })
export class CopilotService {
  constructor(private http: HttpClient) {}

  chat(message: string): Observable<CopilotResponse> {
    return this.http.post<CopilotResponse>(`${environment.apiUrl}/copilot/chat`, { message });
  }

  scanPrescription(payload: { text?: string; file_data?: string }): Observable<CopilotResponse> {
    return this.http.post<CopilotResponse>(`${environment.apiUrl}/copilot/prescription-scan`, payload);
  }
}
