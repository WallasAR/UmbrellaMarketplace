import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductAlternativesResponse, ProductFilters } from '../models/product.model';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient, private tenantService: TenantService) {}

  getProducts(filters: ProductFilters = {}): Observable<Product[]> {
    const tenantId = this.tenantService.getTenantId();
    if (tenantId && !filters.pharmacyId) {
      filters.pharmacyId = tenantId;
    }

    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<Product[]>(`${this.apiUrl}/list`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    // If tenant is defined, we should ideally filter categories by what the tenant has
    // but the backend endpoint /categories currently does not take pharmacyId
    // For now, we'll let it be or just pass a param if backend supports it.
    let params = new HttpParams();
    const tenantId = this.tenantService.getTenantId();
    if (tenantId) params = params.set('pharmacyId', tenantId);

    return this.http.get<string[]>(`${this.apiUrl}/categories`, { params });
  }

  getAlternatives(id: number | string): Observable<ProductAlternativesResponse> {
    return this.http.get<ProductAlternativesResponse>(`${this.apiUrl}/${id}/alternatives`);
  }

  trackSponsoredClick(id: number, source = 'listing'): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${id}/sponsored-click`, { source });
  }

  getSponsored(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/sponsored`);
  }
}
