import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService, SaasPlan } from '../../services/onboarding.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pharmacy-register',
  standalone: false,
  templateUrl: './pharmacy-register.component.html',
  styleUrl: './pharmacy-register.component.css'
})
export class PharmacyRegisterComponent implements OnInit {
  plans: SaasPlan[] = [];
  loading = true;
  submitting = false;
  onboardingStatus = 'none';

  form = {
    name: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    phone: '',
    plan_tier: 'free',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  };

  locating = false;

  constructor(
    private onboardingService: OnboardingService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.onboardingService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.onboardingService.getStatus().subscribe({
      next: (status) => {
        this.onboardingStatus = status.status;
        if (status.status === 'approved') {
          this.router.navigate(['/pharmacy']);
        }
      }
    });
  }

  useCurrentLocation() {
    if (!navigator.geolocation) {
      this.toast.show('Geolocalização não suportada neste navegador.', 'error');
      return;
    }

    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.latitude = position.coords.latitude;
        this.form.longitude = position.coords.longitude;
        this.locating = false;
        this.toast.show('Localização capturada com sucesso.', 'success');
      },
      () => {
        this.locating = false;
        this.toast.show('Não foi possível obter sua localização.', 'error');
      }
    );
  }

  submit() {
    this.submitting = true;
    this.onboardingService.register(this.form).subscribe({
      next: () => {
        this.toast.show('Cadastro enviado para análise.', 'success');
        this.onboardingStatus = 'pending';
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
