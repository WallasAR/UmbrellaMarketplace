import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, PharmacyCheckoutSession } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { CouponService } from '../../services/coupon.service';
import { UserProfile } from '../../models/user.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  profile?: UserProfile;
  couponCode = '';
  couponApplied = false;
  loading = false;
  multiSessions: PharmacyCheckoutSession[] = [];

  constructor(
    public cartService: CartService,
    private userService: UserService,
    private couponService: CouponService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.loadCart();
    this.userService.getProfile().subscribe({
      next: (profile) => this.profile = profile,
      error: () => this.profile = undefined
    });
  }

  applyCoupon() {
    if (!this.couponCode.trim()) return;
    this.couponService.validate(this.couponCode.trim(), this.cartService.subtotal()).subscribe({
      next: () => {
        this.couponApplied = true;
        this.toast.show('Cupom aplicado com sucesso.', 'success');
      },
      error: () => {
        this.couponApplied = false;
      }
    });
  }

  finalize() {
    if (!this.cartService.data().length) return;
    this.loading = true;
    this.multiSessions = [];

    this.cartService.checkoutCart(this.couponApplied ? this.couponCode : undefined).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.mode === 'multi' && res.sessions?.length) {
          this.multiSessions = res.sessions;
          this.toast.show('Seu carrinho possui itens de farmácias diferentes. Finalize cada pagamento abaixo.', 'info');
          return;
        }
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
