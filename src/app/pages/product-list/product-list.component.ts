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
      this.filters = {
        ...this.filters,
        q: params.get('q') || undefined,
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
