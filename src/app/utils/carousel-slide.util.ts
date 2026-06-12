import { LayoutItem } from '../services/layout.service';

export interface CarouselSlideMetadata {
  background_color?: string;
  image_x?: number;
  image_y?: number;
  image_scale?: number;
}

export const DEFAULT_CAROUSEL_METADATA: CarouselSlideMetadata = {
  background_color: '#F74838',
  image_x: 72,
  image_y: 50,
  image_scale: 100
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getCarouselMetadata(item: LayoutItem, fallbackColor = '#F74838'): CarouselSlideMetadata {
  const raw = item.metadata || {};
  return {
    background_color: raw.background_color || fallbackColor,
    image_x: clamp(Number(raw.image_x ?? DEFAULT_CAROUSEL_METADATA.image_x), 0, 100),
    image_y: clamp(Number(raw.image_y ?? DEFAULT_CAROUSEL_METADATA.image_y), 0, 100),
    image_scale: clamp(Number(raw.image_scale ?? DEFAULT_CAROUSEL_METADATA.image_scale), 40, 200)
  };
}

export function ensureCarouselMetadata(item: LayoutItem, fallbackColor = '#F74838'): CarouselSlideMetadata {
  const metadata = getCarouselMetadata(item, fallbackColor);
  item.metadata = { ...metadata };
  return metadata;
}

export function patchCarouselMetadata(
  item: LayoutItem,
  patch: Partial<CarouselSlideMetadata>,
  fallbackColor = '#F74838'
): CarouselSlideMetadata {
  const next = { ...getCarouselMetadata(item, fallbackColor), ...patch };
  item.metadata = next;
  return next;
}
