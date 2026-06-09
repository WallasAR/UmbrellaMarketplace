import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout-success',
  standalone: false,
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css'
})
export class CheckoutSuccessComponent implements OnInit {
  status = '';
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('sessionId');
    if (!sessionId) {
      this.error = 'Sessão de pagamento não encontrada.';
      this.loading = false;
      return;
    }

    this.checkoutService.getPaymentStatus(sessionId).subscribe({
      next: (res) => {
        this.status = res.status;
        this.loading = false;
        if (res.status === 'paid') {
          this.cartService.loadCart();
        }
      },
      error: () => {
        this.error = 'Não foi possível verificar o pagamento.';
        this.loading = false;
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
