import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/user/profile`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/user/edit`, profile);
  }
}
