import { Component, input, output } from '@angular/core';
import { PrescriptionService } from '../../services/prescription.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-prescription-upload',
  standalone: false,
  templateUrl: './prescription-upload.component.html',
  styleUrl: './prescription-upload.component.css'
})
export class PrescriptionUploadComponent {
  medicineId = input.required<number>();
  medicineName = input('');
  uploaded = output<void>();

  loading = false;

  constructor(
    private prescriptionService: PrescriptionService,
    private toast: ToastService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loading = true;
    this.prescriptionService.upload(this.medicineId(), file).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show('Receita enviada para análise.', 'success');
        this.uploaded.emit();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
