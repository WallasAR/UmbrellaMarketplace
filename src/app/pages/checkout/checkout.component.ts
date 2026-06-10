import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, PharmacyCheckoutSession } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { CouponService } from '../../services/coupon.service';
import { Prescription, PrescriptionService } from '../../services/prescription.service';
import { DeliveryQuote, DeliveryService, CourierOption } from '../../services/delivery.service';
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
  unifiedCheckout = false;
  prescriptions: Prescription[] = [];
  fulfillmentMode: 'delivery' | 'pickup' = 'delivery';
  courier: 'local' | 'uber' | '99' = 'local';
  couriers: CourierOption[] = [
    { id: 'local', label: 'Entrega local', available: true, mode: 'local' },
    { id: 'uber', label: 'Uber', available: true, mode: 'simulated' },
    { id: '99', label: '99 Entrega', available: true, mode: 'simulated' }
  ];
  deliveryQuotes: DeliveryQuote[] = [];
  userLat?: number;
  userLng?: number;
  quotingDelivery = false;

  constructor(
    public cartService: CartService,
    private userService: UserService,
    private couponService: CouponService,
    private prescriptionService: PrescriptionService,
    private deliveryService: DeliveryService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.loadCart();
    this.loadPrescriptions();
    this.deliveryService.listCouriers().subscribe({
      next: (items) => {
        if (items?.length) this.couriers = items;
      }
    });
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.requestLocation();
      },
      error: () => this.profile = undefined
    });
  }

  get selectedCourier(): CourierOption | undefined {
    return this.couriers.find((c) => c.id === this.courier);
  }

  courierModeLabel(mode?: string): string {
    if (mode === 'api') return 'Integração ativa';
    if (mode === 'simulated') return 'Cotação estimada';
    return 'Entrega própria';
  }

  get prescriptionItems() {
    return this.cartService.prescriptionRequiredItems();
  }

  get totalDeliveryFee(): number {
    return this.deliveryQuotes.reduce((sum, quote) => sum + quote.price, 0);
  }

  get deliveryQuotesMap(): Record<string, { price: number; eta_minutes?: number; courier?: string }> {
    return Object.fromEntries(
      this.deliveryQuotes.map((quote) => [
        quote.pharmacy_id,
        { price: quote.price, eta_minutes: quote.eta_minutes, courier: quote.courier }
      ])
    );
  }

  prescriptionStatus(medicineId: number): Prescription['status'] | null {
    return this.prescriptionService.getStatusForMedicine(this.prescriptions, medicineId);
  }

  canFinalize(): boolean {
    const prescriptionsOk = this.prescriptionItems.every((item) =>
      this.prescriptionService.isApproved(this.prescriptions, item.medicine_id)
    );
    if (!prescriptionsOk) return false;
    if (this.fulfillmentMode === 'delivery' && !this.deliveryQuotes.length) return false;
    return true;
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

  setFulfillmentMode(mode: 'delivery' | 'pickup') {
    this.fulfillmentMode = mode;
    if (mode === 'delivery') {
      this.fetchDeliveryQuotes();
    } else {
      this.deliveryQuotes = [];
    }
  }

  requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        if (this.fulfillmentMode === 'delivery') this.fetchDeliveryQuotes();
      },
      () => undefined
    );
  }

  fetchDeliveryQuotes() {
    const pharmacyIds = [
      ...new Set(
        this.cartService.data()
          .map((item) => item.Medicine?.pharmacy_id)
          .filter((id): id is string => Boolean(id))
      )
    ];

    if (!pharmacyIds.length || this.userLat == null || this.userLng == null) return;

    this.quotingDelivery = true;
    this.deliveryService.quote({
      pharmacy_ids: pharmacyIds,
      destination_lat: this.userLat,
      destination_lng: this.userLng,
      courier: this.courier
    }).subscribe({
      next: (quotes) => {
        this.deliveryQuotes = quotes;
        this.quotingDelivery = false;
      },
      error: () => {
        this.deliveryQuotes = [];
        this.quotingDelivery = false;
      }
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

    if (!this.canFinalize()) {
      this.toast.show('Envie as receitas e configure a entrega antes de pagar.', 'error');
      return;
    }

    this.loading = true;
    this.multiSessions = [];
    this.unifiedCheckout = false;

    this.cartService.checkoutCart({
      couponCode: this.couponApplied ? this.couponCode : undefined,
      fulfillment_mode: this.fulfillmentMode,
      destination_lat: this.userLat,
      destination_lng: this.userLng,
      destination_address: this.profile?.address,
      courier: this.courier,
      delivery_quotes: this.fulfillmentMode === 'delivery' ? this.deliveryQuotesMap : {}
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.mode === 'unified') {
          this.unifiedCheckout = true;
          this.toast.show(
            `Pagamento unificado para ${res.pharmacy_count || 'várias'} farmácias. Redirecionando...`,
            'info'
          );
        }
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
