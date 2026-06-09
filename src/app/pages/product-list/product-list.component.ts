import { Component, OnInit } from '@angular/core';
import { Product, ProductFilters } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
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
  filters: ProductFilters = { stock: true, sort: 'name_asc' };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
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
