import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AuthResponse {
  message: string;
  token: string;
}

interface JwtPayload {
  id: string;
  email: string;
  role?: string;
  pharmacy_id?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  isAuthenticated = signal(!!localStorage.getItem(this.tokenKey));
  userRole = signal(this.readRoleFromToken());
  pharmacyId = signal(this.readPharmacyFromToken());
  userId = signal(this.readUserIdFromToken());

  isAdmin = computed(() => this.userRole() === 'admin');
  isOperator = computed(() => this.userRole() === 'operator');
  isPharmacist = computed(() => this.userRole() === 'pharmacist');

  isPharmacyStaff = computed(() => {
    const role = this.userRole();
    const hasPharmacy = Boolean(this.pharmacyId());
    return hasPharmacy && ['admin', 'operator', 'pharmacist'].includes(role);
  });

  canReviewPrescriptions = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'pharmacist';
  });

  canManageProducts = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'pharmacist';
  });

  canAccessBilling = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'pharmacist';
  });

  isPharmacyOwner = signal(false);

  setPharmacyOwner(isOwner: boolean) {
    this.isPharmacyOwner.set(isOwner);
  }

  canManageOrders = computed(() => {
    const role = this.userRole();
    return ['admin', 'operator', 'pharmacist'].includes(role);
  });

  canRegisterPharmacy = computed(() =>
    this.isAuthenticated() && !this.pharmacyId() && this.userRole() === 'customer'
  );

  private supabase: SupabaseClient;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/social`, { token: session.access_token }).subscribe({
          next: (res) => {
            this.setToken(res.token);
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Failed to sync social login with backend', err);
            this.supabase.auth.signOut();
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }

  async socialLogin(provider: 'google' | 'facebook') {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/login'
      }
    });
    if (error) throw error;
  }

  signIn(email: string, pass: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, pass }).pipe(
      tap((res) => this.setToken(res.token))
    );
  }

  register(email: string, pass: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, pass }).pipe(
      tap((res) => this.setToken(res.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.userRole.set('guest');
    this.pharmacyId.set(null);
    this.userId.set(null);
    this.isPharmacyOwner.set(false);
    this.router.navigate(['/home']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string {
    return this.userRole();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
    this.userRole.set(this.readRoleFromToken(token));
    this.pharmacyId.set(this.readPharmacyFromToken(token));
    this.userId.set(this.readUserIdFromToken(token));
  }

  private readUserIdFromToken(token = this.getToken()): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      return payload.id || null;
    } catch {
      return null;
    }
  }

  private readPharmacyFromToken(token = this.getToken()): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      return payload.pharmacy_id || null;
    } catch {
      return null;
    }
  }

  private readRoleFromToken(token = this.getToken()): string {
    if (!token) return 'guest';
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      return payload.role || 'customer';
    } catch {
      return 'customer';
    }
  }
}
