import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { InstitutionalBanner, BannerService } from '../../services/banner.service';
import { LayoutItem } from '../../services/layout.service';
import {
  CarouselImageFit,
  CarouselSlideMetadata,
  clampCarouselImageScale,
  clampCarouselImageX,
  clampCarouselImageY,
  getCarouselMetadata,
  patchCarouselMetadata,
  usesFreeCarouselPosition
} from '../../utils/carousel-slide.util';

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
  imageFit: CarouselImageFit;
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
  isDragging = false;
  autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  private dragMode: 'move' | 'resize' | null = null;
  private dragIndex = -1;
  private dragStartX = 0;
  private dragOriginScale = 100;
  private dragPointerOffsetX = 0;
  private dragPointerOffsetY = 0;
  private dragContainer: HTMLElement | null = null;

  constructor(
    private bannerService: BannerService,
    private hostRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
    this.buildSlides();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isDragging) return;

    if (changes['selectedItemIndex'] && this.editable) {
      this.currentIndex = this.selectedItemIndex;
    }

    if (
      changes['items'] ||
      changes['primaryColor'] ||
      changes['layoutOnly'] ||
      changes['previewRevision']
    ) {
      this.buildSlides();
    }
  }

  ngOnDestroy() {
    this.pauseAutoSlide();
    this.endDrag();
  }

  trackSlide(_index: number, slide: Slide): number {
    return slide.sourceIndex;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    if (!this.editable || !this.dragMode || this.dragIndex < 0) return;

    event.preventDefault();

    const container = this.resolveDragContainer();
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const slide = this.slides[this.dragIndex];
    if (!slide) return;

    if (this.dragMode === 'move') {
      slide.imageX = clampCarouselImageX(
        ((event.clientX - this.dragPointerOffsetX - rect.left) / rect.width) * 100
      );
      slide.imageY = clampCarouselImageY(
        ((event.clientY - this.dragPointerOffsetY - rect.top) / rect.height) * 100
      );
      return;
    }

    const delta = ((event.clientX - this.dragStartX) / rect.width) * 100;
    slide.imageScale = clampCarouselImageScale(this.dragOriginScale + delta);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    if (!this.dragMode || this.dragIndex < 0) {
      this.endDrag();
      return;
    }

    const item = this.items[this.dragIndex];
    const slide = this.slides[this.dragIndex];
    if (item && slide) {
      const metadata = patchCarouselMetadata(
        item,
        {
          image_x: slide.imageX,
          image_y: slide.imageY,
          image_scale: slide.imageScale,
          image_fit: slide.imageFit
        },
        this.primaryColor
      );
      this.itemMetadataChange.emit({ index: this.dragIndex, metadata });
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
        imageScale: 100,
        imageFit: 'custom'
      },
      {
        sourceIndex: 1,
        title: 'Entrega rápida e segura',
        subtitle: 'Receba seus medicamentos no conforto de casa',
        backgroundColor: '#e03d2f',
        imageX: 72,
        imageY: 50,
        imageScale: 100,
        imageFit: 'custom'
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
      imageScale: meta.image_scale ?? 100,
      imageFit: meta.image_fit ?? 'custom'
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
      imageScale: 100,
      imageFit: 'custom'
    };
  }

  usesFreePosition(slide: Slide): boolean {
    return usesFreeCarouselPosition(slide.imageFit);
  }

  canDragImage(slide: Slide): boolean {
    return slide.imageFit !== 'fill';
  }

  canResizeImage(slide: Slide): boolean {
    return slide.imageFit !== 'fill';
  }

  imageTransform(slide: Slide): string {
    if (slide.imageFit === 'fill') return 'none';
    if (slide.imageFit === 'custom' || slide.imageScale !== 100) {
      return `scale(${slide.imageScale / 100})`;
    }
    return 'none';
  }

  objectPosition(slide: Slide): string {
    return `${slide.imageX}% ${slide.imageY}%`;
  }

  transformOrigin(slide: Slide): string {
    return `${slide.imageX}% ${slide.imageY}%`;
  }

  private resolveDragContainer(): HTMLElement | null {
    if (this.dragContainer?.isConnected) {
      return this.dragContainer;
    }

    this.dragContainer = this.hostRef.nativeElement.querySelector(
      `[data-carousel-slide-index="${this.dragIndex}"]`
    ) as HTMLElement | null;

    return this.dragContainer;
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

    const slide = this.slides[index];
    if (!slide) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.isDragging = true;
    this.dragMode = mode;
    this.dragIndex = index;
    this.dragStartX = event.clientX;
    this.dragOriginScale = slide.imageScale;
    this.dragContainer = container;

    const anchorX = rect.left + (slide.imageX / 100) * rect.width;
    const anchorY = rect.top + (slide.imageY / 100) * rect.height;
    this.dragPointerOffsetX = event.clientX - anchorX;
    this.dragPointerOffsetY = event.clientY - anchorY;

    if (this.currentIndex !== index) {
      this.currentIndex = index;
    }
  }

  private endDrag() {
    this.isDragging = false;
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
