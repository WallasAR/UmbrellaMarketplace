import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = params.get('q') || '';
      this.applyFilter();
    });
    this.getProducts();
  }

  getProducts() {
    this.http.get<Product[]>(`${environment.apiUrl}/product/list`).subscribe((res: Product[]) => {
      this.products = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredProducts = this.products;
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }
}
