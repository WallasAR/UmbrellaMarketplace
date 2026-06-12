import { LayoutSection } from '../services/layout.service';
import { ProductFilters } from '../models/product.model';

export type ProductSliderLayout = 'horizontal' | 'grid';

export interface ProductSliderFilterConfig {
  category?: string;
  symptom?: string;
  q?: string;
  discount?: boolean;
  stock?: boolean;
  sponsored?: boolean;
  sort?: ProductFilters['sort'];
}

export interface ProductSliderDisplayConfig {
  layout: ProductSliderLayout;
  columns: number;
  rows: number;
  limit: number;
  pagination: boolean;
  items_per_page: number;
}

export interface ProductSliderSectionConfig {
  filter?: ProductSliderFilterConfig;
  display?: Partial<ProductSliderDisplayConfig>;
}

export const DEFAULT_PRODUCT_SLIDER_DISPLAY: ProductSliderDisplayConfig = {
  layout: 'horizontal',
  columns: 4,
  rows: 1,
  limit: 12,
  pagination: false,
  items_per_page: 8
};

export const DEFAULT_PRODUCT_SLIDER_FILTER: ProductSliderFilterConfig = {
  stock: true,
  sort: 'name_asc'
};

export function getProductSliderDisplay(section: LayoutSection): ProductSliderDisplayConfig {
  const raw = (section.config?.display || {}) as Partial<ProductSliderDisplayConfig>;
  const columns = clamp(Number(raw.columns ?? DEFAULT_PRODUCT_SLIDER_DISPLAY.columns), 1, 6);
  const rows = clamp(Number(raw.rows ?? DEFAULT_PRODUCT_SLIDER_DISPLAY.rows), 1, 4);
  const itemsPerPage = clamp(
    Number(raw.items_per_page ?? columns * rows),
    1,
    48
  );

  return {
    layout: raw.layout === 'grid' ? 'grid' : 'horizontal',
    columns,
    rows,
    limit: clamp(Number(raw.limit ?? DEFAULT_PRODUCT_SLIDER_DISPLAY.limit), 1, 48),
    pagination: Boolean(raw.pagination),
    items_per_page: itemsPerPage
  };
}

export function getProductSliderFilter(section: LayoutSection): ProductSliderFilterConfig {
  const legacy = (section.config?.filter || {}) as Record<string, unknown>;
  const raw = { ...DEFAULT_PRODUCT_SLIDER_FILTER, ...legacy } as ProductSliderFilterConfig & {
    is_featured?: boolean;
    pharmacy_id?: string;
  };

  return {
    category: raw.category || undefined,
    symptom: raw.symptom || undefined,
    q: raw.q || undefined,
    discount: raw.discount === true,
    stock: raw.stock !== false,
    sponsored: raw.sponsored === true,
    sort: raw.sort || 'name_asc'
  };
}

export function buildProductSliderApiFilters(
  section: LayoutSection,
  pharmacyId?: string
): ProductFilters & { sponsored?: boolean } {
  const filter = getProductSliderFilter(section);
  const params: ProductFilters & { sponsored?: boolean } = {
    sort: filter.sort
  };

  if (filter.category) params.category = filter.category;
  if (filter.symptom) params.symptom = filter.symptom;
  if (filter.q) params.q = filter.q;
  if (filter.discount) params.discount = true;
  if (filter.stock) params.stock = true;
  if (pharmacyId) params.pharmacyId = pharmacyId;
  if (filter.sponsored) params.sponsored = true;

  return params;
}

export function ensureProductSliderConfig(section: LayoutSection): void {
  if (!section.config) section.config = {};
  if (!section.config.filter) {
    section.config.filter = { ...DEFAULT_PRODUCT_SLIDER_FILTER };
  }
  if (!section.config.display) {
    section.config.display = { ...DEFAULT_PRODUCT_SLIDER_DISPLAY };
  }
}

export function pageSizeForDisplay(display: ProductSliderDisplayConfig): number {
  if (display.pagination) {
    return display.items_per_page;
  }
  if (display.layout === 'grid') {
    return display.columns * display.rows;
  }
  return display.limit;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
