import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { TenantService } from './tenant.service';

export interface SearchSuggestions {
  terms: string[];
  products: Product[];
  categories?: string[];
  brands?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;
  
  // To control modal state globally
  private modalStateSource = new Subject<boolean>();
  modalState$ = this.modalStateSource.asObservable();

  constructor(
    private http: HttpClient,
    private tenantService: TenantService
  ) {}

  openModal() {
    this.modalStateSource.next(true);
  }

  closeModal() {
    this.modalStateSource.next(false);
  }

  getSuggestions(query: string): Observable<SearchSuggestions> {
    let url = `${this.apiUrl}/suggestions?q=${encodeURIComponent(query)}`;
    if (this.tenantService.pharmacyId) {
      url += `&pharmacyId=${this.tenantService.pharmacyId}`;
    }
    return this.http.get<SearchSuggestions>(url);
  }

  getHistory(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/history`);
  }

  saveHistory(term: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/history`, { term });
  }
}
