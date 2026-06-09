import { Component, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product!: Product;
  quantity = signal(1);
  currentIndex = 0;
  loading = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.route.paramMap.pipe(
      switchMap(params => this.productService.getProductById(params.get('id')!))
    ).subscribe(data => {
      this.product = data;
    });
  }

  get imageArray(): string[] {
    const images = Object.values(this.product.Images[0]);
    return images.slice(1);
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    return this.product.discount
      ? this.product.price * (1 - this.product.discount / 100)
      : this.product.price;
  }

  nextImage(): void {
    this.currentIndex = this.currentIndex < this.imageArray.length - 1 ? this.currentIndex + 1 : 0;
  }

  previousImage(): void {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.imageArray.length - 1;
  }

  changeImage(index: number): void {
    this.currentIndex = index;
  }

  increaseQuantity() {
    if (this.quantity() < this.product.stock) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  decreaseQuantity() {
    const current = this.quantity();
    if (current > 1) {
      this.quantity.set(current - 1);
    }
  }

  private requireAuth(): boolean {
    if (!this.authService.getToken()) {
      this.router.navigate(['/auth']);
      return false;
    }
    return true;
  }

  private showFeedback(message: string, type: 'success' | 'error') {
    this.feedbackMessage = message;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 3000);
  }

  addToCart() {
    if (!this.requireAuth()) return;

    this.loading = true;
    this.cartService.addItem(this.product.id, this.quantity()).subscribe({
      next: () => {
        this.loading = false;
        this.showFeedback('Produto adicionado ao carrinho!', 'success');
      },
      error: () => {
        this.loading = false;
        this.showFeedback('Não foi possível adicionar ao carrinho.', 'error');
      }
    });
  }

  buyNow() {
    if (!this.requireAuth()) return;

    this.loading = true;
    this.cartService.checkoutItem(this.product.id, this.quantity()).subscribe({
      next: (res) => {
        this.loading = false;
        window.location.href = res.url;
      },
      error: () => {
        this.loading = false;
        this.showFeedback('Não foi possível iniciar a compra.', 'error');
      }
    });
  }
}
