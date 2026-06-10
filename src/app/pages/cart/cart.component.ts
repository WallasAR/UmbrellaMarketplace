import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { CopilotService, CartInsights } from '../../services/copilot.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  loading = false;
  errorMessage = '';
  insights: CartInsights | null = null;
  insightsLoading = false;

  constructor(
    public cartService: CartService,
    private copilotService: CopilotService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartService.loadCart();
    this.loadInsights();
  }

  get cartItems(): CartItem[] {
    return this.cartService.data();
  }

  get pharmacyGroups() {
    return this.cartService.groupedByPharmacy();
  }

  loadInsights() {
    if (!this.authService.getToken()) return;

    this.insightsLoading = true;
    this.copilotService.getCartInsights().subscribe({
      next: (data) => {
        this.insights = data;
        this.insightsLoading = false;
      },
      error: () => {
        this.insights = null;
        this.insightsLoading = false;
      }
    });
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
      next: () => {
        this.loading = false;
        this.loadInsights();
      },
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
      next: () => {
        this.loading = false;
        this.loadInsights();
      },
      error: () => { this.loading = false; }
    });
  }

  removeItem(item: CartItem) {
    this.loading = true;
    this.cartService.removeItem(item.medicine_id).subscribe({
      next: () => {
        this.loading = false;
        this.loadInsights();
      },
      error: () => { this.loading = false; }
    });
  }
}
