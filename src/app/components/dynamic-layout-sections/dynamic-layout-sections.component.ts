import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LayoutItem, LayoutSection } from '../../services/layout.service';
import { Product } from '../../models/product.model';
import { CarouselSlideMetadata } from '../../utils/carousel-slide.util';
import { getProductSliderFilter } from '../../utils/product-slider.util';

@Component({
  selector: 'app-dynamic-layout-sections',
  standalone: false,
  templateUrl: './dynamic-layout-sections.component.html',
  styleUrl: './dynamic-layout-sections.component.css'
})
export class DynamicLayoutSectionsComponent {
  @Input() sections: LayoutSection[] = [];
  @Input() primaryColor = '#F74838';
  @Input() showSearchPill = true;
  @Input() previewMode = false;
  @Input() carouselEditable = false;
  @Input() carouselSelectedIndex = 0;
  @Output() searchClick = new EventEmitter<void>();
  @Output() carouselItemMetadataChange = new EventEmitter<{ index: number; metadata: CarouselSlideMetadata }>();

  visibleSections(): LayoutSection[] {
    return (this.sections || []).filter((s) => s.section_type !== 'theme_config');
  }

  sectionProducts(section: LayoutSection): Product[] {
    return (section as LayoutSection & { products?: Product[] }).products || [];
  }

  sectionSpotlightProduct(section: LayoutSection): Product | null {
    return (section as LayoutSection & { spotlightProduct?: Product | null }).spotlightProduct || null;
  }

  sectionSpotlightItem(section: LayoutSection): LayoutItem | null {
    return section.items?.[0] || null;
  }

  categoryItems(section: LayoutSection): LayoutSection['items'] {
    const items = section.items || [];
    if (items.length || !this.previewMode) return items;
    return [
      { id: 'ph-1', title: 'Categoria', display_order: 1 },
      { id: 'ph-2', title: 'Categoria', display_order: 2 },
      { id: 'ph-3', title: 'Categoria', display_order: 3 },
      { id: 'ph-4', title: 'Categoria', display_order: 4 }
    ];
  }

  onSearchClick() {
    if (!this.previewMode) {
      this.searchClick.emit();
    }
  }

  productSliderLink(section: LayoutSection): string {
    const category = getProductSliderFilter(section).category;
    return category ? `/category?category=${encodeURIComponent(category)}` : '/category';
  }
}
