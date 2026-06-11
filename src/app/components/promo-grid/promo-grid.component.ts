import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-promo-grid',
  standalone: false,
  templateUrl: './promo-grid.component.html',
  styleUrl: './promo-grid.component.css'
})
export class PromoGridComponent {
  @Input() items: any[] = [];
  @Input() title: string = '';
}
