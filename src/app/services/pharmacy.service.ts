import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NearbyPharmacy {
  id: string;
  name: string;
  address?: string;
  city?: string;
  operational_status?: string;
  distance_km: number;
  latitude?: number;
  longitude?: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  constructor(private http: HttpClient) {}

  getNearby(lat: number, lng: number, radiusKm = 15): Observable<NearbyPharmacy[]> {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng))
      .set('radius_km', String(radiusKm));
    return this.http.get<NearbyPharmacy[]>(`${environment.apiUrl}/pharmacies/nearby`, { params });
  }
}
