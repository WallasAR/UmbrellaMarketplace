import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: false
})
export class ImgFallbackDirective {
  @Input() appImgFallback = 'assets/default-image.png';

  @HostListener('error', ['$event.target'])
  onError(img: HTMLImageElement) {
    img.src = this.appImgFallback;
  }
}
