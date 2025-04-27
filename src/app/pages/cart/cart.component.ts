import { Component, effect, Signal } from '@angular/core';
import { Cart } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,

  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  cartItem!: Signal<Cart[]>;

  constructor( private cartService: CartService ) {
    this.cartItem = this.cartService.data;

    effect(() => {
      this.cartService.getCardItems();
      console.log(this.cartItem)
    })
   }
}
