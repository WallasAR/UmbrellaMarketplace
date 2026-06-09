import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { PrescriptionService } from '../../services/prescription.service';
import { Order } from '../../models/order.model';
import { UserProfile } from '../../models/user.model';
import { Prescription } from '../../services/prescription.service';
import { ToastService } from '../../services/toast.service';
import { PendingPharmacy } from '../../services/onboarding.service';
import { ChartPoint } from '../../components/metrics-bar-chart/metrics-bar-chart.component';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  stats: any = {};
  orders: Order[] = [];
  users: UserProfile[] = [];
  prescriptions: Prescription[] = [];
  pendingPharmacies: PendingPharmacy[] = [];
  financial: any = null;
  financialPeriod = '30d';
  metrics: any = null;
  revenueChart: ChartPoint[] = [];

  constructor(
    private adminService: AdminService,
    private prescriptionService: PrescriptionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.adminService.getDashboard().subscribe((stats) => this.stats = stats);
    this.adminService.getOrders().subscribe((orders) => this.orders = orders);
    this.adminService.getUsers().subscribe((users) => this.users = users);
    this.prescriptionService.listPending().subscribe((items) => this.prescriptions = items);
    this.adminService.getPendingPharmacies().subscribe((items) => this.pendingPharmacies = items);
    this.adminService.getFinancial(this.financialPeriod).subscribe((data) => {
      this.financial = data;
      this.revenueChart = this.toChartPoints(data?.daily);
    });
    this.adminService.getMetrics(this.financialPeriod).subscribe((data) => this.metrics = data);
  }

  changeFinancialPeriod(event: Event) {
    this.financialPeriod = (event.target as HTMLSelectElement).value;
    this.adminService.getFinancial(this.financialPeriod).subscribe((data) => {
      this.financial = data;
      this.revenueChart = this.toChartPoints(data?.daily);
    });
    this.adminService.getMetrics(this.financialPeriod).subscribe((data) => this.metrics = data);
  }

  private toChartPoints(daily: Array<{ date: string; revenue: number }> = []) {
    return daily.map((d) => ({
      label: d.date?.slice(5).replace('-', '/') || '',
      value: d.revenue
    }));
  }

  approvePharmacy(id: string) {
    this.adminService.approvePharmacy(id).subscribe({
      next: () => {
        this.toast.show('Farmácia aprovada.', 'success');
        this.reload();
      }
    });
  }

  rejectPharmacy(id: string) {
    const reason = prompt('Motivo da recusa:') || 'Cadastro recusado';
    this.adminService.rejectPharmacy(id, reason).subscribe({
      next: () => {
        this.toast.show('Farmácia recusada.', 'success');
        this.reload();
      }
    });
  }

  exportFinancial() {
    this.adminService.exportFinancial(this.financialPeriod).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plataforma-${this.financialPeriod}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  updateOrderStatus(sessionId: string, event: Event) {
    const order_status = (event.target as HTMLSelectElement).value;
    this.adminService.updateOrderStatus(sessionId, order_status).subscribe({
      next: () => {
        this.toast.show('Status do pedido atualizado.', 'success');
        this.reload();
      }
    });
  }

  reviewPrescription(id: string, status: 'approved' | 'rejected') {
    this.prescriptionService.review(id, status).subscribe({
      next: () => {
        this.toast.show(`Receita ${status === 'approved' ? 'aprovada' : 'recusada'}.`, 'success');
        this.reload();
      }
    });
  }

  updateRole(userId: string, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.adminService.updateUserRole(userId, role).subscribe({
      next: () => this.toast.show('Perfil atualizado.', 'success')
    });
  }
}
