import { Component, OnInit } from '@angular/core';
import { LayoutService, StoreLayout } from '../../services/layout.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  layout: StoreLayout | null = null;
  featuredProducts: Product[] = [];
  isLoading = true;

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.layoutService.getPublicLayout().subscribe({
      next: (data) => {
        this.layout = data;
        this.loadSectionData(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadSectionData(layout: StoreLayout) {
    layout.sections.forEach(section => {
      if (section.section_type === 'product_slider') {
        const filter = section.config?.filter || {};
        this.productService.getProducts(filter).subscribe({
          next: (products) => {
            // Attach products to the section object temporarily for rendering
            (section as any).products = products;
          }
        });
      }
    });
  }

  openSearchModal() {
    this.searchService.openModal();
  }
}
