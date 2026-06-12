import { Component, OnInit } from '@angular/core';
import { LayoutService, StoreLayout } from '../../services/layout.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { SearchService } from '../../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { buildProductSliderApiFilters } from '../../utils/product-slider.util';

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
        this.loadProductSliderProducts(section, pharmacyId);
      }

      if (section.section_type === 'product_spotlight' && section.config?.product_id) {
        this.productService.getProductById(String(section.config.product_id)).subscribe({
          next: (product) => {
            (section as any).spotlightProduct = product;
          }
        });
      }
    });
  }

  openSearchModal() {
    this.searchService.openModal();
  }

  private loadProductSliderProducts(section: StoreLayout['sections'][number], pharmacyId?: string) {
    const filters = buildProductSliderApiFilters(section, pharmacyId);
    const sponsored = Boolean((filters as { sponsored?: boolean }).sponsored);
    delete (filters as { sponsored?: boolean }).sponsored;

    const request = sponsored
      ? this.productService.getSponsored()
      : this.productService.getProducts(filters);

    request.subscribe({
      next: (products) => {
        let result = products;
        if (sponsored && pharmacyId) {
          result = products.filter((item) => item.pharmacy_id === pharmacyId);
        }
        (section as StoreLayout['sections'][number] & { products?: Product[] }).products = result;
      }
    });
  }
}
