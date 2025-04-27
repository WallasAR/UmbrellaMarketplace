import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Cart } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  data = signal<Cart[]>([]);

  constructor( private http: HttpClient ) { }

  getCardItems() {
    this.http.get<Cart[]>(`${environment.apiUrl}/cart/list`).subscribe({
      next: (items) => this.data.set(items),
      error: (error) => console.error('Error getting cart items:', error)
    });
  };
}
