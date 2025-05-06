import { Component, input, Input, signal } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: false,

  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  product = input.required<Product>();
  isHovered = signal(false)

  getFinalPrice(): number {
    return this.product().discount
      ? this.product().price * (1 - this.product().discount / 100)
      : this.product().price;
  }

  truncateText(text: string, maxLength: number): string {
    return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  setHovered(state: boolean): void {
    this.isHovered.set(state)
  }
}
