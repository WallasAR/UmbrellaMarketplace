import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, PharmacyCheckoutSession } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { CouponService } from '../../services/coupon.service';
import { Prescription, PrescriptionService } from '../../services/prescription.service';
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
  prescriptions: Prescription[] = [];

  constructor(
    public cartService: CartService,
    private userService: UserService,
    private couponService: CouponService,
    private prescriptionService: PrescriptionService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.loadCart();
    this.loadPrescriptions();
    this.userService.getProfile().subscribe({
      next: (profile) => this.profile = profile,
      error: () => this.profile = undefined
    });
  }

  get prescriptionItems() {
    return this.cartService.prescriptionRequiredItems();
  }

  prescriptionStatus(medicineId: number): Prescription['status'] | null {
    return this.prescriptionService.getStatusForMedicine(this.prescriptions, medicineId);
  }

  canFinalize(): boolean {
    return this.prescriptionItems.every((item) =>
      this.prescriptionService.isApproved(this.prescriptions, item.medicine_id)
    );
  }

  loadPrescriptions() {
    this.prescriptionService.list().subscribe({
      next: (items) => this.prescriptions = items ?? [],
      error: () => this.prescriptions = []
    });
  }

  onPrescriptionUploaded() {
    this.loadPrescriptions();
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

    if (!this.canFinalize()) {
      this.toast.show('Envie e aguarde a aprovação das receitas obrigatórias antes de pagar.', 'error');
      return;
    }

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
