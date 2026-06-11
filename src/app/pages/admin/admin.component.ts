import { Component, OnInit } from '@angular/core';
import { AdminService, AuditLogEntry, InstitutionalBanner } from '../../services/admin.service';
import { PrescriptionService } from '../../services/prescription.service';
import { Order } from '../../models/order.model';
import { UserProfile } from '../../models/user.model';
import { Prescription } from '../../services/prescription.service';
import { ToastService } from '../../services/toast.service';

import { ChartPoint } from '../../components/metrics-bar-chart/metrics-bar-chart.component';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  activeTab: string = 'dashboard';

  stats: any = {};
  orders: Order[] = [];
  users: UserProfile[] = [];
  prescriptions: Prescription[] = [];
  pharmacies: any[] = [];
  pharmacyForm = {
    name: '',
    owner_email: ''
  };
  inviteModalOpen = false;
  currentInviteUrl = '';
  selectedKycPharmacyId: string | null = null;
  kycReview: { pharmacy: any; documents: any[] } | null = null;
  financial: any = null;
  financialPeriod = '30d';
  metrics: any = null;
  revenueChart: ChartPoint[] = [];
  conversionChart: ChartPoint[] = [];
  auditLogs: AuditLogEntry[] = [];
  banners: InstitutionalBanner[] = [];
  bannerForm = {
    title: '',
    subtitle: '',
    link_url: '',
    category: '',
    sponsor: '',
    gradient: 'from-[#F74838] to-[#ff7a6f]',
    priority: 0
  };
  bannerImageFile?: File;

  constructor(
    private adminService: AdminService,
    private prescriptionService: PrescriptionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.reload();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  reload() {
    this.adminService.getDashboard().subscribe((stats) => this.stats = stats);
    this.adminService.getOrders().subscribe((orders) => this.orders = orders);
    this.adminService.getUsers().subscribe((users) => this.users = users);
    this.prescriptionService.listPending().subscribe((items) => this.prescriptions = items);
    this.adminService.getAllPharmacies().subscribe((items) => this.pharmacies = items);
    this.adminService.getFinancial(this.financialPeriod).subscribe((data) => {
      this.financial = data;
      this.revenueChart = this.toChartPoints(data?.daily);
    });
    this.adminService.getMetrics(this.financialPeriod).subscribe((data) => {
      this.metrics = data;
      this.conversionChart = this.toConversionChartPoints(data?.dailyConversion);
    });
    this.adminService.getAuditLogs(50).subscribe({
      next: (logs) => this.auditLogs = logs ?? [],
      error: () => this.auditLogs = []
    });
    this.adminService.getBanners().subscribe({
      next: (items) => this.banners = items ?? [],
      error: () => this.banners = []
    });
  }

  createBanner() {
    if (!this.bannerForm.title.trim()) return;

    const publish = (payload: Partial<InstitutionalBanner>) => {
      this.adminService.createBanner(payload).subscribe({
        next: () => {
          this.toast.show('Banner criado.', 'success');
          this.bannerForm = {
            title: '', subtitle: '', link_url: '', category: '', sponsor: '',
            gradient: 'from-[#F74838] to-[#ff7a6f]', priority: 0
          };
          this.bannerImageFile = undefined;
          this.reload();
        }
      });
    };

    if (this.bannerImageFile) {
      this.adminService.createBannerWithFile(this.bannerForm, this.bannerImageFile).subscribe({
        next: () => {
          this.toast.show('Banner criado.', 'success');
          this.bannerForm = {
            title: '', subtitle: '', link_url: '', category: '', sponsor: '',
            gradient: 'from-[#F74838] to-[#ff7a6f]', priority: 0
          };
          this.bannerImageFile = undefined;
          this.reload();
        }
      });
      return;
    }

    publish(this.bannerForm);
  }

  onBannerImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.bannerImageFile = input.files?.[0];
  }

  toggleBanner(banner: InstitutionalBanner) {
    this.adminService.updateBanner(banner.id, { active: !banner.active }).subscribe({
      next: () => this.reload()
    });
  }

  deleteBanner(id: string) {
    if (!confirm('Remover este banner?')) return;
    this.adminService.deleteBanner(id).subscribe({
      next: () => {
        this.toast.show('Banner removido.', 'success');
        this.reload();
      }
    });
  }

  changeFinancialPeriod(event: Event) {
    this.financialPeriod = (event.target as HTMLSelectElement).value;
    this.adminService.getFinancial(this.financialPeriod).subscribe((data) => {
      this.financial = data;
      this.revenueChart = this.toChartPoints(data?.daily);
    });
    this.adminService.getMetrics(this.financialPeriod).subscribe((data) => {
      this.metrics = data;
      this.conversionChart = this.toConversionChartPoints(data?.dailyConversion);
    });
  }

  private toChartPoints(daily: Array<{ date: string; revenue: number }> = []) {
    return daily.map((d) => ({
      label: d.date?.slice(5).replace('-', '/') || '',
      value: d.revenue
    }));
  }

  private toConversionChartPoints(
    daily: Array<{ date: string; conversionRate: number }> = []
  ) {
    return daily.map((d) => ({
      label: d.date?.slice(5).replace('-', '/') || '',
      value: d.conversionRate
    }));
  }

  createPharmacy() {
    if (!this.pharmacyForm.name.trim() || !this.pharmacyForm.owner_email.trim()) return;

    this.adminService.createPharmacy(this.pharmacyForm).subscribe({
      next: (res) => {
        this.toast.show('Farmácia criada.', 'success');
        if (res.invite && res.invite.token) {
          this.currentInviteUrl = `${window.location.origin}/pharmacy/setup?token=${res.invite.token}`;
          this.inviteModalOpen = true;
        }
        this.pharmacyForm = { name: '', owner_email: '' };
        this.reload();
      }
    });
  }

  deletePharmacy(id: string) {
    if (!confirm('Deseja realmente remover esta farmácia?')) return;
    this.adminService.deletePharmacy(id).subscribe({
      next: () => {
        this.toast.show('Farmácia removida.', 'success');
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

  viewKyc(pharmacyId: string) {
    this.selectedKycPharmacyId = pharmacyId;
    this.adminService.getPharmacyKyc(pharmacyId).subscribe({
      next: (data) => this.kycReview = data,
      error: () => this.kycReview = null
    });
  }

  reviewKycDocument(id: string, status: 'approved' | 'rejected') {
    this.adminService.reviewKycDocument(id, status).subscribe({
      next: () => {
        this.toast.show(`Documento ${status === 'approved' ? 'aprovado' : 'recusado'}.`, 'success');
        if (this.selectedKycPharmacyId) this.viewKyc(this.selectedKycPharmacyId);
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
