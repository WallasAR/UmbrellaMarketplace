import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = environment.apiUrl;
  
  private tenantSubject = new BehaviorSubject<any | null>(null);
  public tenant$ = this.tenantSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get pharmacyId(): string | null {
    return this.getTenantId();
  }

  public initTenant(): Promise<boolean> {
    return new Promise((resolve) => {
      // In a real environment, you might use window.location.hostname
      // For local development or Vercel, we can check if it matches a pattern
      // Because we want to test "umbrella-marketplace.vercel.app"
      let currentDomain = window.location.hostname;
      
      // If we are testing locally and want to force the domain:
      if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        currentDomain = 'umbrella-marketplace.vercel.app'; // Force tenant for local tests
      }

      this.http.get<any>(`${this.apiUrl}/pharmacies/resolve-domain?domain=${currentDomain}`)
        .pipe(
          tap((tenant) => {
            if (tenant) {
              this.tenantSubject.next(tenant);
              console.log('[TenantService] Tenant resolved:', tenant.name);
            }
            resolve(true);
          }),
          catchError((err) => {
            console.warn('[TenantService] No tenant found for domain:', currentDomain);
            this.tenantSubject.next(null);
            resolve(true);
            return of(null);
          })
        )
        .subscribe();
    });
  }

  public getTenant(): any | null {
    return this.tenantSubject.getValue();
  }

  public getTenantId(): string | null {
    const tenant = this.getTenant();
    return tenant ? tenant.id : null;
  }
}
