import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InstitutionalBanner {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  sponsor?: string;
  gradient?: string;
  priority?: number;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  constructor(private http: HttpClient) {}

  listActive(category?: string): Observable<InstitutionalBanner[]> {
    const params = category ? { category } : undefined;
    return this.http.get<InstitutionalBanner[]>(`${environment.apiUrl}/banners`, { params });
  }
}
