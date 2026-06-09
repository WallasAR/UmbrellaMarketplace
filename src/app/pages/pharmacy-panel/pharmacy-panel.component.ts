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
  activeTab: 'dashboard' | 'products' | 'batches' | 'orders' | 'alerts' | 'financial' = 'dashboard';
  financial: any = null;
  financialPeriod = '30d';
  dashboard: PharmacyDashboard | null = null;
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
  }

  changeFinancialPeriod(event: Event) {
    this.financialPeriod = (event.target as HTMLSelectElement).value;
    this.reload();
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
