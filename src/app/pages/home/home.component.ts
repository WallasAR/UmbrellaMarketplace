import { Component, OnInit } from '@angular/core';
import { LayoutService, StoreLayout } from '../../services/layout.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { SearchService } from '../../services/search.service';
import { ActivatedRoute } from '@angular/router';

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
  primaryColor = '#F74838';

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private searchService: SearchService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const pharmacyId = params.get('id');
      this.loadLayout(pharmacyId || undefined);
    });
  }

  loadLayout(pharmacyId?: string) {
    this.isLoading = true;
    this.layoutService.getPublicLayout(pharmacyId).subscribe({
      next: (data) => {
        this.layout = data;
        const themeSection = data.sections?.find((s) => s.section_type === 'theme_config');
        this.primaryColor = themeSection?.config?.primary_color || '#F74838';
        this.loadSectionData(data, pharmacyId);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadSectionData(layout: StoreLayout, pharmacyId?: string) {
    layout.sections.forEach(section => {
      if (section.section_type === 'product_slider') {
        const filter = section.config?.filter || {};
        if (pharmacyId) {
          filter.pharmacy_id = pharmacyId;
        }
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
