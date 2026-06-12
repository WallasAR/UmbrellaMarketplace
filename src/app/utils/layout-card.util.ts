import { LayoutItem } from '../services/layout.service';

export type PromoMosaicSlot = 'hero' | 'top' | 'bottom';

export interface PromoMosaicMetadata {
  slot: PromoMosaicSlot;
  badge?: string;
  background_color: string;
  price_original?: string;
  price_current?: string;
  price_note?: string;
}

export interface ProductSpotlightMetadata {
  badge?: string;
  rating?: number;
  review_count?: number;
  features?: string[];
  cta_label?: string;
  footer_note?: string;
}

const DEFAULT_MOSAIC: Record<PromoMosaicSlot, PromoMosaicMetadata & { title: string; subtitle?: string }> = {
  hero: {
    slot: 'hero',
    badge: '25% OFF',
    background_color: '#DFF6F3',
    title: 'Black Garlic Oil',
    subtitle: 'Stronger and Thicker Hair With Black Garlic Oil.',
    price_original: 'R$ 37,00',
    price_current: 'R$ 37,00',
    price_note: 'Inclui impostos'
  },
  top: {
    slot: 'top',
    badge: '25% OFF',
    background_color: '#FCE7EF',
    title: 'Dental Care Set for Vivid and Bright Smiles',
    price_original: 'R$ 33,90',
    price_current: 'R$ 22,90',
    price_note: 'Inclui impostos'
  },
  bottom: {
    slot: 'bottom',
    badge: '25% OFF',
    background_color: '#E6E9FA',
    title: 'Banana Flavoured Toothpaste',
    price_original: 'R$ 37,00',
    price_current: 'R$ 37,00',
    price_note: 'Inclui impostos'
  }
};

export function getPromoMosaicMetadata(item: LayoutItem): PromoMosaicMetadata {
  const raw = item.metadata || {};
  return {
    slot: (raw.slot as PromoMosaicSlot) || 'hero',
    badge: raw.badge || '25% OFF',
    background_color: raw.background_color || '#F3F4F6',
    price_original: raw.price_original || '',
    price_current: raw.price_current || '',
    price_note: raw.price_note || ''
  };
}

export function ensurePromoMosaicItem(item: LayoutItem, slot: PromoMosaicSlot): void {
  const defaults = DEFAULT_MOSAIC[slot];
  item.metadata = {
    ...defaults,
    ...item.metadata,
    slot
  };
  if (!item.title) item.title = defaults.title;
  if (!item.subtitle && defaults.subtitle) item.subtitle = defaults.subtitle;
}

export function createDefaultPromoMosaicItems(): LayoutItem[] {
  return (['hero', 'top', 'bottom'] as PromoMosaicSlot[]).map((slot, index) => {
    const defaults = DEFAULT_MOSAIC[slot];
    const item: LayoutItem = {
      id: crypto.randomUUID(),
      display_order: index,
      title: defaults.title,
      subtitle: defaults.subtitle,
      image_url: ''
    };
    ensurePromoMosaicItem(item, slot);
    return item;
  });
}

export function getProductSpotlightMetadata(item: LayoutItem): ProductSpotlightMetadata {
  const raw = item.metadata || {};
  const features = Array.isArray(raw.features)
    ? raw.features
    : typeof raw.features === 'string'
      ? raw.features.split('\n').map((line: string) => line.trim()).filter(Boolean)
      : [];

  return {
    badge: raw.badge || 'Mais Vendido',
    rating: Number(raw.rating ?? 4.8),
    review_count: Number(raw.review_count ?? 1234),
    features: features.length
      ? features
      : [
          'Alívio rápido para dores leves a moderadas',
          'Fórmula versátil para diferentes tipos de desconforto',
          'Comprimidos revestidos de fácil deglutição'
        ],
    cta_label: raw.cta_label || 'Adicionar ao carrinho',
    footer_note: raw.footer_note || 'Entrega grátis acima de R$ 35'
  };
}

export function createDefaultSpotlightItem(): LayoutItem {
  const item: LayoutItem = {
    id: crypto.randomUUID(),
    display_order: 0,
    title: 'Extra Strength Pain Relief Tablets',
    subtitle: '',
    image_url: ''
  };
  item.metadata = getProductSpotlightMetadata(item);
  return item;
}

export function mosaicItemBySlot(items: LayoutItem[], slot: PromoMosaicSlot): LayoutItem | undefined {
  return items.find((item) => getPromoMosaicMetadata(item).slot === slot);
}
