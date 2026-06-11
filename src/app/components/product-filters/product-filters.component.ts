import { Component, OnInit, output } from '@angular/core';
import { ProductFilters } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-filters',
  standalone: false,
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.css'
})
export class ProductFiltersComponent implements OnInit {
  filtersChange = output<ProductFilters>();

  categories: string[] = [];
  commonSymptoms: string[] = ['Dor de Cabeça', 'Febre', 'Gripe e Resfriado', 'Alergia', 'Enjoo', 'Azia'];
  
  filters: ProductFilters = { sort: 'name_asc' };
  nearbyEnabled = false;
  geoLoading = false;
  geoError = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: () => this.categories = []
    });
    this.emitFilters();
  }

  emitFilters() {
    this.filtersChange.emit({ ...this.filters });
  }

  toggleCategory(cat: string) {
    if (this.filters.category === cat) {
      this.filters.category = undefined;
    } else {
      this.filters.category = cat;
    }
    this.emitFilters();
  }

  toggleSymptom(symp: string) {
    if (this.filters.symptom === symp) {
      this.filters.symptom = undefined;
    } else {
      this.filters.symptom = symp;
    }
    this.emitFilters();
  }

  setSort(sort: string) {
    this.filters.sort = sort as 'price_asc' | 'price_desc' | 'discount_desc' | 'name_asc';
    this.emitFilters();
  }

  toggleDiscount() {
    this.filters.discount = !this.filters.discount;
    this.emitFilters();
  }

  toggleNearby(enabled: boolean) {
    this.nearbyEnabled = enabled;
    if (!enabled) {
      this.filters = { ...this.filters, lat: undefined, lng: undefined, radius_km: undefined };
      this.emitFilters();
      return;
    }

    this.geoLoading = true;
    this.geoError = '';

    if (!navigator.geolocation) {
      this.geoError = 'Geolocalização indisponível';
      this.nearbyEnabled = false;
      this.geoLoading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.filters = {
          ...this.filters,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius_km: 15
        };
        this.geoLoading = false;
        this.emitFilters();
      },
      () => {
        this.geoError = 'Permissão de localização negada';
        this.nearbyEnabled = false;
        this.geoLoading = false;
      }
    );
  }
}
