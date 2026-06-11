import { Component, signal } from '@angular/core';
import { Product, ProductAlternativesResponse } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { PriceAlertService } from '../../services/price-alert.service';
import { ToastService } from '../../services/toast.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product!: Product;
  alternatives?: ProductAlternativesResponse;
  quantity = signal(1);
  currentIndex = 0;
  loading = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  alertTargetPrice = 0;
  alertLoading = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private priceAlertService: PriceAlertService,
    private toast: ToastService,
    private router: Router
  ) {
    this.route.paramMap.pipe(
      switchMap(params => this.productService.getProductById(params.get('id')!))
    ).subscribe(data => {
      this.product = data;
      this.productService.getAlternatives(data.id).subscribe({
        next: (alt) => this.alternatives = alt,
        error: () => this.alternatives = undefined
      });
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

    if (this.product.requires_prescription) {
      this.router.navigate(['/prescription'], { queryParams: { medicine_id: this.product.id, qty: this.quantity() } });
      return;
    }

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

    if (this.product.requires_prescription) {
      this.router.navigate(['/prescription'], { queryParams: { medicine_id: this.product.id, qty: this.quantity(), checkout: true } });
      return;
    }

    this.loading = true;
    this.cartService.addItem(this.product.id, this.quantity()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/checkout']);
      },
      error: () => {
        this.loading = false;
        this.showFeedback('Não foi possível iniciar a compra.', 'error');
      }
    });
  }

  subscribe() {
    if (!this.requireAuth()) return;

    this.loading = true;
    this.subscriptionService.subscribe(this.product.id, this.quantity()).subscribe({
      next: (res) => {
        this.loading = false;
        window.location.href = res.url;
      },
      error: () => {
        this.loading = false;
        this.showFeedback('Não foi possível iniciar a assinatura.', 'error');
      }
    });
  }

  createPriceAlert() {
    if (!this.requireAuth()) return;
    if (!this.alertTargetPrice || this.alertTargetPrice >= this.finalPrice) {
      this.toast.show('Informe um preço alvo menor que o preço atual.', 'error');
      return;
    }

    this.alertLoading = true;
    this.priceAlertService.create(this.product.id, this.alertTargetPrice).subscribe({
      next: () => {
        this.alertLoading = false;
        this.toast.show('Alerta de preço criado! Você será avisado quando baixar.', 'success');
      },
      error: () => {
        this.alertLoading = false;
        this.toast.show('Não foi possível criar o alerta.', 'error');
      }
    });
  }
}
