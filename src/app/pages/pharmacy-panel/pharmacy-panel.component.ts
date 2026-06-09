import { Component, OnInit } from '@angular/core';
import {
  MedicineBatch,
  PharmacyAlerts,
  PharmacyDashboard,
  PharmacyPanelService,
  PharmacyProduct
} from '../../services/pharmacy-panel.service';
import { Order } from '../../models/order.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pharmacy-panel',
  standalone: false,
  templateUrl: './pharmacy-panel.component.html',
  styleUrl: './pharmacy-panel.component.css'
})
export class PharmacyPanelComponent implements OnInit {
  activeTab: 'dashboard' | 'products' | 'batches' | 'orders' | 'alerts' | 'financial' | 'billing' = 'dashboard';
  financial: any = null;
  financialPeriod = '30d';
  billing: any = null;
  dashboard: PharmacyDashboard | null = null;
  metrics: any = null;
  editingProductId: number | null = null;
  editForm: Partial<PharmacyProduct> = {};
  products: PharmacyProduct[] = [];
  batches: MedicineBatch[] = [];
  orders: Order[] = [];
  alerts: PharmacyAlerts | null = null;

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
    requires_prescription: false,
    allows_subscription: false
  };

  constructor(
    private pharmacyService: PharmacyPanelService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.reload();
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.reload();
  }

  reload() {
    this.pharmacyService.getDashboard().subscribe((data) => this.dashboard = data);

    if (this.activeTab === 'dashboard') {
      this.pharmacyService.getMetrics('30d').subscribe((data) => this.metrics = data);
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
    }

    if (this.activeTab === 'alerts') {
      this.pharmacyService.getAlerts().subscribe((data) => this.alerts = data);
    }

    if (this.activeTab === 'financial') {
      this.pharmacyService.getFinancial(this.financialPeriod).subscribe((data) => this.financial = data);
    }

    if (this.activeTab === 'billing') {
      this.pharmacyService.getBilling().subscribe((data) => this.billing = data);
    }
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
}
