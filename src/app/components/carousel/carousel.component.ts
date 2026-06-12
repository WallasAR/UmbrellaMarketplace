import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { InstitutionalBanner, BannerService } from '../../services/banner.service';
import { LayoutItem } from '../../services/layout.service';
import { CarouselSlideMetadata, getCarouselMetadata, patchCarouselMetadata } from '../../utils/carousel-slide.util';

interface Slide {
  sourceIndex: number;
  title: string;
  subtitle: string;
  linkUrl?: string;
  imageUrl?: string;
  backgroundColor: string;
  imageX: number;
  imageY: number;
  imageScale: number;
}

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() items: LayoutItem[] = [];
  @Input() layoutOnly = false;
  @Input() editable = false;
  @Input() selectedItemIndex = 0;
  @Input() primaryColor = '#F74838';
  @Input() previewRevision = 0;
  @Output() itemMetadataChange = new EventEmitter<{ index: number; metadata: CarouselSlideMetadata }>();

  slides: Slide[] = [];
  currentIndex = 0;
  autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  private dragMode: 'move' | 'resize' | null = null;
  private dragIndex = -1;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOriginX = 0;
  private dragOriginY = 0;
  private dragOriginScale = 100;
  private dragPointerOffsetX = 0;
  private dragPointerOffsetY = 0;
  private dragContainer: HTMLElement | null = null;
  private pendingMetadata: { index: number; metadata: CarouselSlideMetadata } | null = null;

  constructor(private bannerService: BannerService) {}

  ngOnInit() {
    this.buildSlides();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedItemIndex'] && this.editable) {
      this.currentIndex = this.selectedItemIndex;
    }

    if (
      changes['items'] ||
      changes['primaryColor'] ||
      changes['layoutOnly'] ||
      (changes['previewRevision'] && !this.dragMode)
    ) {
      this.buildSlides();
    }
  }

  ngOnDestroy() {
    this.pauseAutoSlide();
    this.endDrag();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    if (!this.editable || !this.dragMode || this.dragIndex < 0 || !this.dragContainer) return;

    const rect = this.dragContainer.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const item = this.items[this.dragIndex];
    if (!item) return;

    if (this.dragMode === 'move') {
      const imageX = ((event.clientX - this.dragPointerOffsetX - rect.left) / rect.width) * 100;
      const imageY = ((event.clientY - this.dragPointerOffsetY - rect.top) / rect.height) * 100;
      const metadata = patchCarouselMetadata(item, { image_x: imageX, image_y: imageY }, this.primaryColor);
      this.syncSlide(this.dragIndex, item);
      this.pendingMetadata = { index: this.dragIndex, metadata };
      return;
    }

    const delta = ((event.clientX - this.dragStartX) / rect.width) * 100;
    const metadata = patchCarouselMetadata(item, {
      image_scale: this.dragOriginScale + delta
    }, this.primaryColor);
    this.syncSlide(this.dragIndex, item);
    this.pendingMetadata = { index: this.dragIndex, metadata };
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    if (this.pendingMetadata) {
      this.itemMetadataChange.emit(this.pendingMetadata);
      this.pendingMetadata = null;
    }
    this.endDrag();
  }

  private buildSlides() {
    this.pauseAutoSlide();

    if (this.layoutOnly) {
      if (!this.items?.length) {
        this.slides = [];
        return;
      }

      this.slides = this.items.map((item, index) => this.toLayoutSlide(item, index));
      this.clampCurrentIndex();
      this.startAutoSlide();
      return;
    }

    if (this.items?.length) {
      this.slides = this.items.map((item, index) => this.toLayoutSlide(item, index));
      this.clampCurrentIndex();
      this.startAutoSlide();
      return;
    }

    this.bannerService.listActive().subscribe({
      next: (banners) => {
        if (banners?.length) {
          this.slides = banners.map((banner, index) => this.toBannerSlide(banner, index));
        } else {
          this.slides = this.defaultSlides();
        }
        this.clampCurrentIndex();
        this.startAutoSlide();
      },
      error: () => {
        this.slides = this.defaultSlides();
        this.startAutoSlide();
      }
    });
  }

  private defaultSlides(): Slide[] {
    return [
      {
        sourceIndex: 0,
        title: 'Medicamentos com até 40% OFF',
        subtitle: 'Genéricos de qualidade com preços acessíveis',
        backgroundColor: '#F74838',
        imageX: 72,
        imageY: 50,
        imageScale: 100
      },
      {
        sourceIndex: 1,
        title: 'Entrega rápida e segura',
        subtitle: 'Receba seus medicamentos no conforto de casa',
        backgroundColor: '#e03d2f',
        imageX: 72,
        imageY: 50,
        imageScale: 100
      }
    ];
  }

  private toLayoutSlide(item: LayoutItem, index: number): Slide {
    const meta = getCarouselMetadata(item, this.primaryColor);
    return {
      sourceIndex: index,
      title: item.title || '',
      subtitle: item.subtitle || '',
      linkUrl: item.link_url,
      imageUrl: item.image_url,
      backgroundColor: meta.background_color || this.primaryColor,
      imageX: meta.image_x ?? 72,
      imageY: meta.image_y ?? 50,
      imageScale: meta.image_scale ?? 100
    };
  }

  private toBannerSlide(banner: InstitutionalBanner, index: number): Slide {
    return {
      sourceIndex: index,
      title: banner.title,
      subtitle: banner.subtitle || '',
      linkUrl: banner.link_url,
      imageUrl: banner.image_url,
      backgroundColor: '#F74838',
      imageX: 72,
      imageY: 50,
      imageScale: 100
    };
  }

  private syncSlide(index: number, item: LayoutItem) {
    if (!this.slides[index]) return;
    const meta = getCarouselMetadata(item, this.primaryColor);
    const updated: Slide = {
      ...this.slides[index],
      title: item.title || '',
      subtitle: item.subtitle || '',
      linkUrl: item.link_url,
      imageUrl: item.image_url,
      backgroundColor: meta.background_color || this.primaryColor,
      imageX: meta.image_x ?? 72,
      imageY: meta.image_y ?? 50,
      imageScale: meta.image_scale ?? 100
    };
    this.slides = this.slides.map((slide, idx) => (idx === index ? updated : slide));
  }

  private clampCurrentIndex() {
    if (!this.slides.length) {
      this.currentIndex = 0;
      return;
    }
    if (this.currentIndex >= this.slides.length) {
      this.currentIndex = 0;
    }
  }

  startDrag(event: MouseEvent, index: number, mode: 'move' | 'resize') {
    if (!this.editable) return;
    event.preventDefault();
    event.stopPropagation();
    this.pauseAutoSlide();

    const container = (event.currentTarget as HTMLElement).closest('.carousel-slide-canvas') as HTMLElement | null;
    if (!container) return;

    const item = this.items[index];
    if (!item) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const meta = getCarouselMetadata(item, this.primaryColor);
    this.dragMode = mode;
    this.dragIndex = index;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOriginX = meta.image_x ?? 72;
    this.dragOriginY = meta.image_y ?? 50;
    this.dragOriginScale = meta.image_scale ?? 100;
    this.dragContainer = container;
    this.pendingMetadata = null;

    const anchorX = rect.left + (this.dragOriginX / 100) * rect.width;
    const anchorY = rect.top + (this.dragOriginY / 100) * rect.height;
    this.dragPointerOffsetX = event.clientX - anchorX;
    this.dragPointerOffsetY = event.clientY - anchorY;

    if (this.currentIndex !== index) {
      this.currentIndex = index;
    }
  }

  private endDrag() {
    this.dragMode = null;
    this.dragIndex = -1;
    this.dragContainer = null;
    if (this.slides.length > 1 && !this.autoSlideInterval) {
      this.startAutoSlide();
    }
  }

  startAutoSlide() {
    if (this.editable || this.slides.length <= 1) return;
    this.pauseAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 8000);
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  nextSlide() {
    if (!this.slides.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    if (!this.slides.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  hasText(slide: Slide): boolean {
    return Boolean(slide.title?.trim() || slide.subtitle?.trim());
  }
}
