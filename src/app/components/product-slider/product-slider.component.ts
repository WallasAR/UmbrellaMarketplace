import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-slider',
  standalone: false,
  templateUrl: './product-slider.component.html',
  styleUrl: './product-slider.component.css'
})
export class ProductSliderComponent {
  @Input() title: string = '';
  @Input() linkUrl?: string = '/home';
  @Input() products: Product[] = [];
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';

  @ViewChild('slider') sliderRef!: ElementRef;

  isDown = false;
  startX = 0;
  scrollLeft = 0;

  scroll(direction: number) {
    const el = this.sliderRef.nativeElement;
    const scrollAmount = 300;
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  onMouseDown(e: MouseEvent) {
    this.isDown = true;
    const el = this.sliderRef.nativeElement;
    el.classList.add('cursor-grabbing');
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  onMouseLeave() {
    this.isDown = false;
    this.sliderRef.nativeElement.classList.remove('cursor-grabbing');
  }

  onMouseUp() {
    this.isDown = false;
    this.sliderRef.nativeElement.classList.remove('cursor-grabbing');
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const el = this.sliderRef.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2; // Scroll-fast
    el.scrollLeft = this.scrollLeft - walk;
  }
}
