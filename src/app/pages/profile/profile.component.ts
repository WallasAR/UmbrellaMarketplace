import { Component, OnInit } from '@angular/core';
import { UserProfile } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';
import { Prescription, PrescriptionService } from '../../services/prescription.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: Partial<UserProfile> = {};
  prescriptions: Prescription[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private prescriptionService: PrescriptionService,
    private toast: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe((profile) => this.profile = profile);
    this.prescriptionService.list().subscribe((items) => this.prescriptions = items);
  }

  async enablePush() {
    const enabled = await this.notificationService.enablePushNotifications();
    if (enabled) {
      this.toast.show('Notificações push ativadas.', 'success');
    } else {
      this.toast.show('Não foi possível ativar notificações push.', 'error');
    }
  }

  save() {
    this.loading = true;
    this.userService.updateProfile(this.profile).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Perfil atualizado com sucesso.', 'success');
      },
      error: () => { this.loading = false; }
    });
  }
}
