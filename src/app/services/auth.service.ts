import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'token';
  isAuthenticated = signal(!!localStorage.getItem(this.tokenKey));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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
    this.router.navigate(['/home']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
  }
}
