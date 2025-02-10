import { Component, input, Input } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: false,

  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  product = input.required<Product>();

  getFinalPrice(): number {
    return this.product().discount
      ? this.product().price * (1 - this.product().discount / 100)
      : this.product().price;
  }
}
