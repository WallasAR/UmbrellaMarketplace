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

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const clampCarouselImageX = (value: number) => clamp(value, -15, 115);
export const clampCarouselImageY = (value: number) => clamp(value, -15, 115);
export const clampCarouselImageScale = (value: number) => clamp(value, 40, 200);

export function getCarouselMetadata(item: LayoutItem, fallbackColor = '#F74838'): CarouselSlideMetadata {
  const raw = item.metadata || {};
  return {
    background_color: raw.background_color || fallbackColor,
    image_x: clampCarouselImageX(toNumber(raw.image_x, DEFAULT_CAROUSEL_METADATA.image_x!)),
    image_y: clampCarouselImageY(toNumber(raw.image_y, DEFAULT_CAROUSEL_METADATA.image_y!)),
    image_scale: clampCarouselImageScale(toNumber(raw.image_scale, DEFAULT_CAROUSEL_METADATA.image_scale!))
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
  const merged = { ...getCarouselMetadata(item, fallbackColor), ...patch };
  const next: CarouselSlideMetadata = {
    background_color: merged.background_color || fallbackColor,
    image_x: clampCarouselImageX(toNumber(merged.image_x, DEFAULT_CAROUSEL_METADATA.image_x!)),
    image_y: clampCarouselImageY(toNumber(merged.image_y, DEFAULT_CAROUSEL_METADATA.image_y!)),
    image_scale: clampCarouselImageScale(toNumber(merged.image_scale, DEFAULT_CAROUSEL_METADATA.image_scale!))
  };
  item.metadata = next;
  return next;
}
