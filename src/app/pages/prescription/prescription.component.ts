import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PrescriptionService } from '../../services/prescription.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { switchMap, catchError, of } from 'rxjs';

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

  medicineId: number | null = null;
  quantity: number = 1;
  isCheckout: boolean = false;
  medicine: Product | null = null;
  isLoadingMedicine = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private prescriptionService: PrescriptionService,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.medicineId = params['medicine_id'] ? Number(params['medicine_id']) : null;
      this.quantity = params['qty'] ? Number(params['qty']) : 1;
      this.isCheckout = params['checkout'] === 'true';

      if (this.medicineId) {
        this.isLoadingMedicine = true;
        this.productService.getProductById(this.medicineId.toString()).subscribe({
          next: (prod) => {
            this.medicine = prod;
            this.isLoadingMedicine = false;
          },
          error: () => {
            this.isLoadingMedicine = false;
            this.errorMsg = 'Medicamento não encontrado.';
          }
        });
      }
    });
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
  }

  cancel() {
    this.router.navigate(['/category']);
  }

  sendPrescription() {
    if (!this.selectedFile || !this.medicineId) return;
    this.isUploading = true;
    this.errorMsg = '';
    
    this.prescriptionService.upload(this.medicineId, this.selectedFile).subscribe({
      next: (prescription) => {
        // Upload done, now add to cart
        this.cartService.addItem(this.medicineId!, this.quantity).subscribe({
          next: () => {
            this.isUploading = false;
            this.uploadSuccess = true;
            setTimeout(() => {
              this.router.navigate([this.isCheckout ? '/checkout' : '/cart']);
            }, 2000);
          },
          error: () => {
            this.isUploading = false;
            this.errorMsg = 'Receita enviada, mas não foi possível adicionar ao carrinho.';
          }
        });
      },
      error: () => {
        this.isUploading = false;
        this.errorMsg = 'Erro ao enviar a receita. Tente novamente.';
      }
    });
  }
}
