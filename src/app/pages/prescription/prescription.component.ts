import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CopilotService } from '../../services/copilot.service';

@Component({
  selector: 'app-prescription',
  standalone: false,
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.css'
})
export class PrescriptionComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  uploadSuccess = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private copilotService: CopilotService
  ) {}

  ngOnInit() {
    // No longer need medicine_id
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMsg = '';
  }

  cancel() {
    this.router.navigate(['/home']);
  }

  sendPrescription() {
    if (!this.selectedFile || !this.previewUrl) return;
    this.isUploading = true;
    this.errorMsg = '';
    
    // Extract base64 data without the data URI prefix
    const base64Data = this.previewUrl.split(',')[1];
    
    this.copilotService.prescriptionToCart({ file_data: base64Data }).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.successMsg = res.message || 'Receita analisada e produtos adicionados ao carrinho!';
        setTimeout(() => {
          this.router.navigate(['/cart']);
        }, 2500);
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMsg = err.error?.message || 'Erro ao analisar a receita. Verifique se a imagem está legível e tente novamente.';
      }
    });
  }
}
