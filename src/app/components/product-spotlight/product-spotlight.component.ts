import { Component, Input } from '@angular/core';
import { LayoutItem } from '../../services/layout.service';
import { Product } from '../../models/product.model';
import { getProductSpotlightMetadata } from '../../utils/layout-card.util';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-spotlight',
  standalone: false,
  templateUrl: './product-spotlight.component.html',
  styleUrl: './product-spotlight.component.css'
})
export class ProductSpotlightComponent {
  @Input() title = '';
  @Input() item: LayoutItem | null = null;
  @Input() product: Product | null = null;
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';

  constructor(private cartService: CartService, private router: Router) {}

  meta() {
    return getProductSpotlightMetadata(this.item || { id: '', display_order: 0 });
  }

  displayTitle(): string {
    return this.product?.name || this.item?.title || 'Produto em destaque';
  }

  displayImage(): string {
    if (this.product?.Images?.[0]?.primary_img || this.product?.Images?.[0]?.thumb_img) {
      return this.product.Images[0].primary_img || this.product.Images[0].thumb_img;
    }
    return this.item?.image_url || '';
  }

  displayPrice(): string {
    if (this.product) {
      const price = this.product.discount
        ? this.product.price * (1 - this.product.discount / 100)
        : this.product.price;
      return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return '';
  }

  rating(): number {
    return this.product?.average_rating ?? this.meta().rating ?? 4.8;
  }

  reviewCount(): number {
    return this.product?.review_count ?? this.meta().review_count ?? 0;
  }

  features(): string[] {
    return this.meta().features || [];
  }

  addToCart() {
    if (this.previewMode || !this.product) return;
    this.cartService.addItem(this.product.id, 1).subscribe({
      next: () => this.router.navigate(['/cart'])
    });
  }

  goToProduct() {
    if (this.previewMode) return;
    const id = this.product?.id;
    if (id) this.router.navigate(['/product', id]);
  }
}
