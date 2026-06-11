import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

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
    return this.http.get<StoreLayout>(url).pipe(
      tap(layout => {
        if (layout && layout.sections) {
          const themeSection = layout.sections.find(s => s.section_type === 'theme_config');
          if (themeSection && themeSection.config && themeSection.config.primary_color) {
            document.documentElement.style.setProperty('--color-brand', themeSection.config.primary_color);
            // Optionally, add a softer version for backgrounds
            document.documentElement.style.setProperty('--color-brand-soft', themeSection.config.primary_color + '15');
            document.documentElement.style.setProperty('--color-brand-hover', themeSection.config.primary_color + 'E6');
          }
        }
      })
    );
  }
}
