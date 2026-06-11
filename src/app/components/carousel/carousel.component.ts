import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { InstitutionalBanner, BannerService } from '../../services/banner.service';
import { LayoutItem } from '../../pages/pharmacy-panel/layout-config/layout-config.component';

interface Slide {
  title: string;
  subtitle: string;
  gradient: string;
  linkUrl?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() items: LayoutItem[] = [];
  slides: Slide[] = [
    { title: 'Medicamentos com até 40% OFF', subtitle: 'Genéricos de qualidade com preços acessíveis', gradient: 'from-[#F74838] to-[#ff7a6f]' },
    { title: 'Entrega rápida e segura', subtitle: 'Receba seus medicamentos no conforto de casa', gradient: 'from-[#e03d2f] to-[#F74838]' }
  ];

  currentIndex = 0;
  autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private bannerService: BannerService) {}

  ngOnInit() {
    if (this.items && this.items.length > 0) {
      this.slides = this.items.map(item => ({
        title: item.title || '',
        subtitle: item.subtitle || '',
        gradient: 'from-[#F74838] to-[#ff7a6f]',
        linkUrl: item.link_url,
        imageUrl: item.image_url
      }));
      this.startAutoSlide();
    } else {
      // Fallback to legacy banner service if no items passed
      this.bannerService.listActive().subscribe({
        next: (banners) => {
          if (banners?.length) {
            this.slides = banners.map((banner) => this.toSlide(banner));
          }
          this.startAutoSlide();
        },
        error: () => this.startAutoSlide()
      });
    }
  }

  ngOnDestroy() { this.pauseAutoSlide(); }

  private toSlide(banner: InstitutionalBanner): Slide {
    return {
      title: banner.title,
      subtitle: banner.subtitle || '',
      gradient: banner.gradient || 'from-[#F74838] to-[#ff7a6f]',
      linkUrl: banner.link_url,
      imageUrl: banner.image_url
    };
  }

  startAutoSlide() {
    this.pauseAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 8000);
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  nextSlide() { this.currentIndex = (this.currentIndex + 1) % this.slides.length; }
  prevSlide() { this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length; }
  goToSlide(index: number) { this.currentIndex = index; }
}
