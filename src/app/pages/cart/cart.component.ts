import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  loading = false;
  checkoutLoading = false;
  errorMessage = '';

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.cartService.loadCart();
  }

  get cartItems(): CartItem[] {
    return this.cartService.data();
  }

  getItemImage(item: CartItem): string {
    return item.Medicine?.Images?.[0]?.thumb_img || '/defaultmed.png';
  }

  getItemPrice(item: CartItem): number {
    return this.cartService.getItemPrice(item);
  }

  increaseQuantity(item: CartItem) {
    if (item.quantity >= item.Medicine.stock) return;
    this.loading = true;
    this.cartService.updateQuantity(item.medicine_id, 1).subscribe({
      next: () => { this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }
    this.loading = true;
    this.cartService.updateQuantity(item.medicine_id, -1).subscribe({
      next: () => { this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  removeItem(item: CartItem) {
    this.loading = true;
    this.cartService.removeItem(item.medicine_id).subscribe({
      next: () => { this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  checkout() {
    if (this.cartItems.length === 0) return;

    this.checkoutLoading = true;
    this.errorMessage = '';
    this.cartService.checkoutCart().subscribe({
      next: (res) => {
        this.checkoutLoading = false;
        window.location.href = res.url;
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.errorMessage = err?.error?.message || 'Não foi possível iniciar o checkout.';
      }
    });
  }
}
