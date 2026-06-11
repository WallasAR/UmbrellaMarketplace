import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pharmacy-setup',
  standalone: false,
  templateUrl: './pharmacy-setup.component.html',
  styleUrl: './pharmacy-setup.component.css'
})
export class PharmacySetupComponent implements OnInit {
  token: string | null = null;
  form = {
    password: '',
    confirmPassword: '',
    cnpj: '',
    phone: '',
    address: ''
  };
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toast.show('Link de convite inválido ou ausente.', 'error');
      this.router.navigate(['/']);
    }
  }

  submit() {
    if (this.form.password !== this.form.confirmPassword) {
      this.toast.show('As senhas não coincidem.', 'error');
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/onboarding/complete-invite`, {
      token: this.token,
      password: this.form.password,
      cnpj: this.form.cnpj,
      phone: this.form.phone,
      address: this.form.address
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toast.show('Cadastro concluído com sucesso!', 'success');
        // Save the token so they are logged in
        localStorage.setItem('token', res.token);
        this.router.navigate(['/pharmacy']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.show(err.error?.message || 'Erro ao finalizar cadastro.', 'error');
      }
    });
  }
}
