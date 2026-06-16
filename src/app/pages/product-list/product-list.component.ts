import { Component, OnInit } from '@angular/core';
import { Product, ProductFilters } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { SymptomService } from '../../services/symptom.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;
  filters: ProductFilters = { sort: 'name_asc' };
  activeSymptom?: string;

  constructor(
    private productService: ProductService,
    private symptomService: SymptomService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.activeSymptom = params.get('symptom') || undefined;
      
      let queryParam = params.get('q') || undefined;
      let discountParam = params.get('discount') === 'true' ? true : undefined;
      let maxPriceParam = params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined;
      let sortParam = params.get('sort') as any || this.filters.sort;
      
      if (queryParam) {
        const normalizedQ = queryParam.trim().toLowerCase();
        if (normalizedQ === 'promocao' || normalizedQ === 'promoção') {
          queryParam = undefined;
          discountParam = true;
        } else if (normalizedQ === 'oferta' || normalizedQ === 'ofertas') {
          queryParam = undefined;
          maxPriceParam = 50; // Map "Menos de R$ 50"
        } else if (normalizedQ === 'lancamento' || normalizedQ === 'lançamento' || normalizedQ === 'top') {
          queryParam = undefined;
          // Just clear the search to show all products or apply standard sort
        }
      }

      this.filters = {
        ...this.filters,
        q: queryParam,
        discount: discountParam,
        maxPrice: maxPriceParam,
        sort: sortParam,
        category: params.get('category') || undefined
      };
      this.loadProducts();
    });
  }

  onFiltersChange(filters: ProductFilters) {
    this.filters = { ...this.filters, ...filters };
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = false;

    if (this.activeSymptom) {
      this.symptomService.search(this.activeSymptom).subscribe({
        next: (res) => {
          this.products = res.results;
          this.loading = false;
        },
        error: () => {
          this.products = [];
          this.loading = false;
          this.error = true;
        }
      });
      return;
    }

    this.productService.getProducts(this.filters).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
        this.error = true;
      }
    });
  }
}
