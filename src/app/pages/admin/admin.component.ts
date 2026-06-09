import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { PrescriptionService } from '../../services/prescription.service';
import { Order } from '../../models/order.model';
import { UserProfile } from '../../models/user.model';
import { Prescription } from '../../services/prescription.service';
import { ToastService } from '../../services/toast.service';

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
