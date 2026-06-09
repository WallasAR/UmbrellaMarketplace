import { Component, OnInit } from '@angular/core';
import { UserProfile } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
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
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe((profile) => this.profile = profile);
    this.prescriptionService.list().subscribe((items) => this.prescriptions = items);
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
