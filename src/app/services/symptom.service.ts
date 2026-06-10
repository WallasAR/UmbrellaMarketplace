import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface SymptomOption {
  id: string;
  label: string;
}

export interface SymptomSearchResponse {
  query: string;
  terms: string[];
  results: Product[];
}

@Injectable({ providedIn: 'root' })
export class SymptomService {
  constructor(private http: HttpClient) {}

  list(): Observable<SymptomOption[]> {
    return this.http.get<SymptomOption[]>(`${environment.apiUrl}/symptoms`);
  }

  search(symptom: string): Observable<SymptomSearchResponse> {
    const params = new HttpParams().set('q', symptom);
    return this.http.get<SymptomSearchResponse>(`${environment.apiUrl}/symptoms/search`, { params });
  }
}
