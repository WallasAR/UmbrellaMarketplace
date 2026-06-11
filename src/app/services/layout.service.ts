import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LayoutItem {
  id: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  display_order: number;
  metadata?: any;
}

export interface LayoutSection {
  id: string;
  section_type: string;
  title?: string;
  subtitle?: string;
  display_order: number;
  config?: any;
  items?: LayoutItem[];
}

export interface StoreLayout {
  id: string;
  name: string;
  isPreset: boolean;
  sections: LayoutSection[];
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private apiUrl = `${environment.apiUrl}/layout`;

  constructor(private http: HttpClient) {}

  getPublicLayout(pharmacyId?: string): Observable<StoreLayout> {
    const url = pharmacyId ? `${this.apiUrl}/public?pharmacy_id=${pharmacyId}` : `${this.apiUrl}/public`;
    return this.http.get<StoreLayout>(url);
  }
}
