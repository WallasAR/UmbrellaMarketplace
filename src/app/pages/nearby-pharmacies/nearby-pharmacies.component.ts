import { Component, OnInit } from '@angular/core';
import { NearbyPharmacy, PharmacyService } from '../../services/pharmacy.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-nearby-pharmacies',
  standalone: false,
  templateUrl: './nearby-pharmacies.component.html',
  styleUrl: './nearby-pharmacies.component.css'
})
export class NearbyPharmaciesComponent implements OnInit {
  pharmacies: NearbyPharmacy[] = [];
  loading = false;
  error = '';
  radiusKm = 15;

  constructor(
    private pharmacyService: PharmacyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.locate();
  }

  locate() {
    this.loading = true;
    this.error = '';

    if (!navigator.geolocation) {
      this.error = 'Geolocalização não disponível neste navegador.';
      this.loading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.loadNearby(position.coords.latitude, position.coords.longitude),
      () => {
        this.error = 'Não foi possível obter sua localização. Verifique as permissões.';
        this.loading = false;
        this.toast.show(this.error, 'error');
      }
    );
  }

  loadNearby(lat: number, lng: number) {
    this.pharmacyService.getNearby(lat, lng, this.radiusKm).subscribe({
      next: (items) => {
        this.pharmacies = items ?? [];
        this.loading = false;
      },
      error: () => {
        this.pharmacies = [];
        this.error = 'Erro ao buscar farmácias próximas.';
        this.loading = false;
      }
    });
  }

  statusLabel(status?: string) {
    const map: Record<string, string> = {
      open: 'Aberta',
      closed: 'Fechada',
      out_of_area: 'Fora da área'
    };
    return map[status || ''] || status || '—';
  }
}
