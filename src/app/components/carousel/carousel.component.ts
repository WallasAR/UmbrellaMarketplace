import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: false,

  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  images: string[] = [
    'https://wallpapers.com/images/high/1280x720-gaming-v33j4ujb652vgpzh.webp',
    'https://wallpapers.com/images/high/1280x720-gaming-oucz9ej7rfewwz8x.webp',
    'https://wallpapers.com/images/high/1280x720-gaming-5jgwyjesow4g3q6p.webp',
    'https://wallpapers.com/images/high/1280x720-gaming-cb44q0xydxlp42ir.webp',
    'https://wallpapers.com/images/high/1280x720-gaming-r7u488t4vegob7me.webp'
  ];

  currentIndex: number = 0;
  autoSlideInterval: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.autoSlideInterval);
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 10000);
  }

  pauseAutoSlide() {
    clearInterval(this.autoSlideInterval);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

}
