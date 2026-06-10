import { Component, input, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: false,

  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  product = input.required<Product>();
  isHovered = signal(false);

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  getFinalPrice(): number {
    return this.product().discount
      ? this.product().price * (1 - this.product().discount / 100)
      : this.product().price;
  }

  truncateText(text: string, maxLength: number): string {
    return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  setHovered(state: boolean): void {
    this.isHovered.set(state);
  }

  onProductClick() {
    if (!this.product().sponsored || !this.authService.getToken()) return;
    this.productService.trackSponsoredClick(this.product().id, 'listing').subscribe();
  }
}
