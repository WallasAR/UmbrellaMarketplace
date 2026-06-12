import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../../models/product.model';
import {
  getProductSliderDisplay,
  ProductSliderDisplayConfig,
  ProductSliderSectionConfig
} from '../../utils/product-slider.util';

@Component({
  selector: 'app-product-slider',
  standalone: false,
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.css'
})
export class ProductSliderComponent implements OnChanges {
  @Input() title = '';
  @Input() linkUrl?: string = '/category';
  @Input() products: Product[] = [];
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';
  @Input() displayConfig: ProductSliderSectionConfig['display'] | null = null;
  @Input() previewRevision = 0;

  @ViewChild('slider') sliderRef?: ElementRef<HTMLElement>;

  display: ProductSliderDisplayConfig = {
    layout: 'horizontal',
    columns: 4,
    rows: 1,
    limit: 12,
    pagination: false,
    items_per_page: 8
  };

  visibleProducts: Product[] = [];
  currentPage = 0;
  totalPages = 1;

  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['displayConfig'] || changes['products'] || changes['previewRevision']) {
      this.display = getProductSliderDisplay({ config: { display: this.displayConfig || {} } } as any);
      this.applyVisibleProducts();
    }
  }

  get isGrid(): boolean {
    return this.display.layout === 'grid';
  }

  get gridStyle(): Record<string, string> {
    return {
      'grid-template-columns': `repeat(${this.display.columns}, minmax(0, 1fr))`
    };
  }

  get placeholderCount(): number {
    if (this.previewMode) {
      return this.display.pagination
        ? this.display.items_per_page
        : this.isGrid
          ? this.display.columns * this.display.rows
          : 4;
    }
    return 0;
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  private applyVisibleProducts() {
    const limited = (this.products || []).slice(0, this.display.limit);

    if (!this.display.pagination) {
      if (this.isGrid) {
        this.visibleProducts = limited.slice(0, this.display.columns * this.display.rows);
      } else {
        this.visibleProducts = limited;
      }
      this.totalPages = 1;
      this.currentPage = 0;
      return;
    }

    const pageSize = this.display.items_per_page;
    this.totalPages = Math.max(1, Math.ceil(limited.length / pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
    const start = this.currentPage * pageSize;
    this.visibleProducts = limited.slice(start, start + pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage += 1;
      this.applyVisibleProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage -= 1;
      this.applyVisibleProducts();
    }
  }

  scroll(direction: number) {
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * 300, behavior: 'smooth' });
  }

  onMouseDown(e: MouseEvent) {
    if (this.isGrid || this.display.pagination) return;
    this.isDown = true;
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    el.classList.add('cursor-grabbing');
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  onMouseLeave() {
    this.isDown = false;
    this.sliderRef?.nativeElement?.classList.remove('cursor-grabbing');
  }

  onMouseUp() {
    this.isDown = false;
    this.sliderRef?.nativeElement?.classList.remove('cursor-grabbing');
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDown || this.isGrid || this.display.pagination) return;
    e.preventDefault();
    const el = this.sliderRef?.nativeElement;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2;
    el.scrollLeft = this.scrollLeft - walk;
  }
}
