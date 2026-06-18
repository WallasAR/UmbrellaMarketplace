import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface IpInfo {
  city?: string;
  postal?: string;
  region?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private http: HttpClient) {}

  guessLocation(): Observable<string | null> {
    const savedLoc = localStorage.getItem('guest_location');
    if (savedLoc) {
      return of(savedLoc);
    }

    return this.http.get<IpInfo>('https://ipinfo.io/json').pipe(
      map(res => {
        if (res.city) {
          return `${res.city}${res.postal ? ' ' + res.postal.replace('-', '') : ''}`;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  setCustomLocation(location: string): void {
    localStorage.setItem('guest_location', location);
  }
}
