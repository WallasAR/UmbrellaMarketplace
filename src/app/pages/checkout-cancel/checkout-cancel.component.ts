import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: false,
  templateUrl: './checkout-cancel.component.html',
  styleUrl: './checkout-cancel.component.css'
})
export class CheckoutCancelComponent {
  constructor(private router: Router) {}

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
