import { LayoutItem } from '../services/layout.service';

export type CarouselImageFit = 'custom' | 'cover' | 'contain' | 'fill';

export interface CarouselSlideMetadata {
  background_color?: string;
  image_x?: number;
  image_y?: number;
  image_scale?: number;
  image_fit?: CarouselImageFit;
}

export const DEFAULT_CAROUSEL_METADATA: CarouselSlideMetadata = {
  background_color: '#F74838',
  image_x: 72,
  image_y: 50,
  image_scale: 100,
  image_fit: 'custom'
};

export const CAROUSEL_IMAGE_FIT_LABELS: Record<CarouselImageFit, string> = {
  custom: 'Ajuste manual',
  cover: 'Preencher área (recorta excesso)',
  contain: 'Conter sem cortar',
  fill: 'Esticar para preencher'
};

export const CAROUSEL_FILL_PRESETS: Record<'cover' | 'contain' | 'fill' | 'custom', Partial<CarouselSlideMetadata>> = {
  cover: { image_fit: 'cover', image_x: 50, image_y: 50, image_scale: 100 },
  contain: { image_fit: 'contain', image_x: 50, image_y: 50, image_scale: 100 },
  fill: { image_fit: 'fill', image_x: 50, image_y: 50, image_scale: 100 },
  custom: { image_fit: 'custom', image_x: 72, image_y: 50, image_scale: 100 }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeImageFit = (value: unknown): CarouselImageFit => {
  if (value === 'cover' || value === 'contain' || value === 'fill' || value === 'custom') {
    return value;
  }
  return DEFAULT_CAROUSEL_METADATA.image_fit!;
};

export const clampCarouselImageX = (value: number) => clamp(value, -15, 115);
export const clampCarouselImageY = (value: number) => clamp(value, -15, 115);
export const clampCarouselImageScale = (value: number) => clamp(value, 20, 400);

export function getCarouselMetadata(item: LayoutItem, fallbackColor = '#F74838'): CarouselSlideMetadata {
  const raw = item.metadata || {};
  return {
    background_color: raw.background_color || fallbackColor,
    image_x: clampCarouselImageX(toNumber(raw.image_x, DEFAULT_CAROUSEL_METADATA.image_x!)),
    image_y: clampCarouselImageY(toNumber(raw.image_y, DEFAULT_CAROUSEL_METADATA.image_y!)),
    image_scale: clampCarouselImageScale(toNumber(raw.image_scale, DEFAULT_CAROUSEL_METADATA.image_scale!)),
    image_fit: normalizeImageFit(raw.image_fit)
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
    image_scale: clampCarouselImageScale(toNumber(merged.image_scale, DEFAULT_CAROUSEL_METADATA.image_scale!)),
    image_fit: normalizeImageFit(merged.image_fit)
  };
  item.metadata = next;
  return next;
}

export function usesFreeCarouselPosition(fit: CarouselImageFit): boolean {
  return fit === 'custom';
}
