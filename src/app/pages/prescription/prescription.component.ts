import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescription',
  standalone: false,
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.css'
})
export class PrescriptionComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  uploadSuccess = false;

  constructor(private router: Router) {}

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
  }

  sendPrescription() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    
    // Simulate upload delay
    setTimeout(() => {
      this.isUploading = false;
      this.uploadSuccess = true;
      // Navigate to cart or somewhere after success
      setTimeout(() => this.router.navigate(['/cart']), 3000);
    }, 2000);
  }
}
