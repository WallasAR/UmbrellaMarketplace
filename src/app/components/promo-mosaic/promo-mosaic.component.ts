import { Component, Input } from '@angular/core';
import { LayoutItem } from '../../services/layout.service';
import { getPromoMosaicMetadata, mosaicItemBySlot } from '../../utils/layout-card.util';

@Component({
  selector: 'app-promo-mosaic',
  standalone: false,
  templateUrl: './promo-mosaic.component.html',
  styleUrl: './promo-mosaic.component.css'
})
export class PromoMosaicComponent {
  @Input() title = '';
  @Input() items: LayoutItem[] = [];
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';

  heroItem(): LayoutItem | undefined {
    return mosaicItemBySlot(this.items, 'hero') || this.items[0];
  }

  topItem(): LayoutItem | undefined {
    return mosaicItemBySlot(this.items, 'top') || this.items[1];
  }

  bottomItem(): LayoutItem | undefined {
    return mosaicItemBySlot(this.items, 'bottom') || this.items[2];
  }

  meta(item?: LayoutItem) {
    return getPromoMosaicMetadata(item || { id: '', display_order: 0 });
  }

  hasContent(): boolean {
    return this.items.length > 0;
  }
}
