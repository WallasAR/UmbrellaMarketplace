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
  filters: ProductFilters = { sort: 'name_asc', stock: true };

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
}
