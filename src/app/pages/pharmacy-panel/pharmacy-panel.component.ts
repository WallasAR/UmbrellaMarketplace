import { Component, OnInit } from '@angular/core';
import {
  MedicineBatch,
  PharmacyAlerts,
  PharmacyDashboard,
  PharmacyDelivery,
  PharmacyPanelService,
  PharmacyProduct,
  PriceBenchmark
} from '../../services/pharmacy-panel.service';
import { Prescription } from '../../services/prescription.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { ToastService } from '../../services/toast.service';
import { ChartPoint } from '../../components/metrics-bar-chart/metrics-bar-chart.component';

type PharmacyTab = 'dashboard' | 'products' | 'batches' | 'orders' | 'alerts' | 'financial' | 'billing' | 'prescriptions';

@Component({
  selector: 'app-pharmacy-panel',
  standalone: false,
  templateUrl: './pharmacy-panel.component.html',
  styleUrl: './pharmacy-panel.component.css'
})
export class PharmacyPanelComponent implements OnInit {
  activeTab: PharmacyTab = 'dashboard';
  financial: any = null;
  financialPeriod = '30d';
  revenueChart: ChartPoint[] = [];
  conversionChart: ChartPoint[] = [];
  billing: any = null;
  dashboard: PharmacyDashboard | null = null;
  metrics: any = null;
  editingProductId: number | null = null;
  editForm: Partial<PharmacyProduct> = {};
  products: PharmacyProduct[] = [];
  batches: MedicineBatch[] = [];
  orders: Order[] = [];
  alerts: PharmacyAlerts | null = null;
  pendingPrescriptions: Prescription[] = [];

  batchForm = {
    medicine_id: 0,
    batch_number: '',
    quantity: 1,
    expiry_date: ''
  };

  productForm = {
    name: '',
    price: 0,
    discount: 0,
    stock: 0,
    category: '',
    description: '',
    active_ingredient: '',
    laboratory: '',
    medicine_type: 'reference' as 'reference' | 'generic',
    dosage: '',
    requires_prescription: false,
    allows_subscription: false
  };

  connectStatus: any = null;
  kycDocuments: any[] = [];
  deliveries: PharmacyDelivery[] = [];
  pickupCodeInput = '';
  priceBenchmark: PriceBenchmark | null = null;
  benchmarkProductId: number | null = null;

  constructor(
    private pharmacyService: PharmacyPanelService,
    public authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.reload();
  }

  canShowTab(tab: PharmacyTab): boolean {
    const role = this.authService.getRole();

    if (role === 'admin') return true;

    if (role === 'operator') {
      return ['dashboard', 'orders'].includes(tab);
    }

    if (role === 'pharmacist') {
      if (tab === 'billing') {
        return this.authService.isPharmacyOwner();
      }
      return true;
    }

    return false;
  }

  setTab(tab: PharmacyTab) {
    if (!this.canShowTab(tab)) return;
    this.activeTab = tab;
    this.reload();
  }

  reload() {
    this.pharmacyService.getDashboard().subscribe((data) => {
      this.dashboard = data;
      const ownerId = (data?.pharmacy as { owner_user_id?: string } | undefined)?.owner_user_id;
      this.authService.setPharmacyOwner(Boolean(ownerId && ownerId === this.authService.userId()));
    });

    if (this.activeTab === 'dashboard') {
      this.pharmacyService.getMetrics('30d').subscribe((data) => {
        this.metrics = data;
        this.conversionChart = this.toConversionChartPoints(data?.dailyConversion);
      });
    }

    if (this.activeTab === 'products' || this.activeTab === 'batches') {
      this.pharmacyService.getProducts().subscribe((items) => {
        this.products = items;
        if (!this.batchForm.medicine_id && items.length) {
          this.batchForm.medicine_id = items[0].id;
        }
      });
    }

    if (this.activeTab === 'batches') {
      this.pharmacyService.getBatches().subscribe((items) => this.batches = items);
    }

    if (this.activeTab === 'orders') {
      this.pharmacyService.getOrders().subscribe((items) => this.orders = items);
      this.pharmacyService.getDeliveries().subscribe((items) => this.deliveries = items);
    }

    if (this.activeTab === 'prescriptions') {
      this.pharmacyService.listPendingPrescriptions().subscribe((items) => this.pendingPrescriptions = items);
    }

    if (this.activeTab === 'alerts') {
      this.pharmacyService.getAlerts().subscribe((data) => this.alerts = data);
    }

    if (this.activeTab === 'financial') {
      this.pharmacyService.getFinancial(this.financialPeriod).subscribe((data) => {
        this.financial = data;
        this.revenueChart = (data?.daily || []).map((d: { date: string; revenue: number }) => ({
          label: d.date?.slice(5).replace('-', '/') || '',
          value: d.revenue
        }));
      });
    }

    if (this.activeTab === 'billing') {
      this.pharmacyService.getBilling().subscribe((data) => this.billing = data);
      this.pharmacyService.getConnectStatus().subscribe((data) => this.connectStatus = data);
      this.pharmacyService.listKycDocuments().subscribe((docs) => this.kycDocuments = docs);
    }
  }

  connectStripe() {
    this.pharmacyService.startConnectOnboarding().subscribe({
      next: (res) => {
        if (res.url) window.location.href = res.url;
      }
    });
  }

  onKycFileSelected(event: Event, documentType: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.pharmacyService.uploadKycDocument(documentType, file).subscribe({
      next: () => {
        this.toast.show('Documento enviado para análise.', 'success');
        this.reload();
      }
    });
  }

  reviewPrescription(id: string, status: 'approved' | 'rejected') {
    this.pharmacyService.reviewPrescription(id, status).subscribe({
      next: () => {
        this.toast.show(status === 'approved' ? 'Receita aprovada.' : 'Receita recusada.', 'success');
        this.reload();
      }
    });
  }

  upgradePlan(planTier: string) {
    this.pharmacyService.checkoutPlan(planTier).subscribe({
      next: (res) => {
        if (res.mode === 'checkout' && res.url) {
          window.location.href = res.url;
          return;
        }
        this.toast.show('Plano atualizado.', 'success');
        this.reload();
      }
    });
  }

  manageBilling() {
    this.pharmacyService.openBillingPortal().subscribe({
      next: (res) => {
        if (res.url) window.location.href = res.url;
      }
    });
  }

  changeFinancialPeriod(event: Event) {
    this.financialPeriod = (event.target as HTMLSelectElement).value;
    this.reload();
  }

  startEdit(product: PharmacyProduct) {
    this.editingProductId = product.id;
    this.editForm = { ...product };
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editForm = {};
  }

  saveEdit() {
    if (!this.editingProductId) return;
    this.pharmacyService.updateProduct(this.editingProductId, this.editForm).subscribe({
      next: () => {
        this.toast.show('Produto atualizado.', 'success');
        this.cancelEdit();
        this.reload();
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Remover este produto?')) return;
    this.pharmacyService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.show('Produto removido.', 'success');
        this.reload();
      }
    });
  }

  createProduct() {
    if (!this.productForm.name || !this.productForm.price) {
      this.toast.show('Informe nome e preço do produto.', 'error');
      return;
    }

    this.pharmacyService.createProduct(this.productForm).subscribe({
      next: () => {
        this.toast.show('Produto cadastrado.', 'success');
        this.productForm = {
          name: '', price: 0, discount: 0, stock: 0, category: '', description: '',
          active_ingredient: '', laboratory: '', medicine_type: 'reference', dosage: '',
          requires_prescription: false, allows_subscription: false
        };
        this.reload();
      }
    });
  }

  exportFinancial() {
    this.pharmacyService.exportFinancial(this.financialPeriod).subscribe({
      next: (blob) => this.downloadCsv(blob, `financeiro-${this.financialPeriod}.csv`)
    });
  }

  private toConversionChartPoints(
    daily: Array<{ date: string; conversionRate: number }> = []
  ) {
    return daily.map((d) => ({
      label: d.date?.slice(5).replace('-', '/') || '',
      value: d.conversionRate
    }));
  }

  private downloadCsv(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  updateOperationalStatus(event: Event) {
    const operational_status = (event.target as HTMLSelectElement).value;
    this.pharmacyService.updateOperationalStatus(operational_status).subscribe({
      next: () => {
        this.toast.show('Status operacional atualizado.', 'success');
        this.reload();
      }
    });
  }

  createBatch() {
    if (!this.batchForm.medicine_id || !this.batchForm.batch_number || !this.batchForm.expiry_date) {
      this.toast.show('Preencha todos os campos do lote.', 'error');
      return;
    }

    this.pharmacyService.createBatch(this.batchForm).subscribe({
      next: () => {
        this.toast.show('Lote cadastrado.', 'success');
        this.batchForm = { medicine_id: this.batchForm.medicine_id, batch_number: '', quantity: 1, expiry_date: '' };
        this.reload();
      }
    });
  }

  deleteBatch(id: string) {
    this.pharmacyService.deleteBatch(id).subscribe({
      next: () => {
        this.toast.show('Lote removido.', 'success');
        this.reload();
      }
    });
  }

  updateOrderStatus(sessionId: string, event: Event) {
    const order_status = (event.target as HTMLSelectElement).value;
    this.pharmacyService.updateOrderStatus(sessionId, order_status).subscribe({
      next: () => {
        this.toast.show('Status do pedido atualizado.', 'success');
        this.reload();
      }
    });
  }

  scanAlerts() {
    this.pharmacyService.scanAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.toast.show('Varredura de alertas concluída.', 'success');
      }
    });
  }

  confirmPickup() {
    if (!this.pickupCodeInput.trim()) return;
    this.pharmacyService.confirmPickup(this.pickupCodeInput.trim()).subscribe({
      next: () => {
        this.toast.show('Retirada confirmada com sucesso.', 'success');
        this.pickupCodeInput = '';
        this.reload();
      }
    });
  }

  advanceDelivery(id: string) {
    this.pharmacyService.advanceDelivery(id).subscribe({
      next: () => {
        this.toast.show('Status da entrega atualizado.', 'success');
        this.reload();
      }
    });
  }

  deliveryStatusLabel(status: string) {
    const map: Record<string, string> = {
      pending: 'Pendente',
      awaiting_driver: 'Aguardando motorista',
      picked_up: 'Coletado',
      in_transit: 'Em trânsito',
      delivered: 'Entregue'
    };
    return map[status] || status;
  }

  loadPriceBenchmark(productId: number) {
    this.benchmarkProductId = productId;
    this.pharmacyService.getPriceBenchmark(productId).subscribe({
      next: (data) => this.priceBenchmark = data,
      error: () => this.priceBenchmark = null
    });
  }

  benchmarkPositionLabel(position: string) {
    const map: Record<string, string> = {
      cheapest: 'Menor preço do mercado',
      competitive: 'Preço competitivo',
      above_market: 'Acima da média'
    };
    return map[position] || position;
  }
}
