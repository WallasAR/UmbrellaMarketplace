import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  
  // Set of medicine IDs that are favorited by the current user
  public favorites = signal<Set<number>>(new Set());

  constructor(private http: HttpClient, private authService: AuthService) {
    if (this.authService.getToken()) {
      this.loadFavorites();
    }
  }

  loadFavorites() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      const ids = new Set(data.map(item => item.medicine_id));
      this.favorites.set(ids);
    });
  }

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  isFavorite(medicineId: number): boolean {
    return this.favorites().has(medicineId);
  }

  toggleFavorite(medicineId: number): Observable<any> {
    if (this.isFavorite(medicineId)) {
      // Remove
      const current = new Set(this.favorites());
      current.delete(medicineId);
      this.favorites.set(current); // Optimistic update
      
      return this.http.delete(`${this.apiUrl}/${medicineId}`).pipe(
        tap({
          error: () => {
            // Revert on error
            const reverted = new Set(this.favorites());
            reverted.add(medicineId);
            this.favorites.set(reverted);
          }
        })
      );
    } else {
      // Add
      const current = new Set(this.favorites());
      current.add(medicineId);
      this.favorites.set(current); // Optimistic update
      
      return this.http.post(`${this.apiUrl}/${medicineId}`, {}).pipe(
        tap({
          error: () => {
            // Revert on error
            const reverted = new Set(this.favorites());
            reverted.delete(medicineId);
            this.favorites.set(reverted);
          }
        })
      );
    }
  }
}
