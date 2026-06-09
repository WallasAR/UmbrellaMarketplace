import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  User?: { name: string; avatar: string };
}

export interface ReviewSummary {
  average: number;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  getProductReviews(medicineId: number): Observable<{ reviews: Review[]; summary: ReviewSummary }> {
    return this.http.get<{ reviews: Review[]; summary: ReviewSummary }>(`${environment.apiUrl}/reviews/product/${medicineId}`);
  }

  addReview(payload: { medicine_id: number; rating: number; comment?: string; pharmacy_id?: string }) {
    return this.http.post(`${environment.apiUrl}/reviews`, payload);
  }
}
