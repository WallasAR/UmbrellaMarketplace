import { Component, OnDestroy, OnInit } from '@angular/core';

interface Slide {
  title: string;
  subtitle: string;
  gradient: string;
}

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    { title: 'Medicamentos com até 40% OFF', subtitle: 'Genéricos de qualidade com preços acessíveis', gradient: 'from-[#F74838] to-[#ff7a6f]' },
    { title: 'Entrega rápida e segura', subtitle: 'Receba seus medicamentos no conforto de casa', gradient: 'from-[#e03d2f] to-[#F74838]' },
    { title: 'Cuidado com sua saúde', subtitle: 'Produtos selecionados com qualidade garantida', gradient: 'from-[#c93428] to-[#F74838]' },
    { title: 'Dermocosméticos em destaque', subtitle: 'Cuidados com a pele das melhores marcas', gradient: 'from-[#F74838] to-[#ff9a92]' }
  ];

  currentIndex = 0;
  autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() { this.startAutoSlide(); }
  ngOnDestroy() { this.pauseAutoSlide(); }

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
