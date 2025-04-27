import { Component, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  standalone: false,

  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product!: Product;
  quantity = signal(1);
  currentIndex: number = 0; // Índice da imagem atual

  constructor (
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
    this.route.paramMap.pipe(
      switchMap(params => this.productService.getProductById(params.get("id")!))
    ).subscribe(data => {
      this.product = data;
    })
  }

  // Getter para converter o objeto em um array iterável
  get imageArray(): string[] {
    const images = Object.values(this.product.Images[0]);
    return images.slice(1); // Remove a primeira imagem
  }

  // Método para avançar para a próxima imagem
  nextImage(): void {
    if (this.currentIndex < this.imageArray.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Volta ao início
    }
  }

  // Método para voltar para a imagem anterior
  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.imageArray.length - 1; // Vai para o final
    }
  }

  // Método para mudar a imagem principal ao clicar na imagem miniatura
  changeImage(index: number): void {
    this.currentIndex = index;
  }

  // Métodos para incrementar ou decrementar o valor
  increaseQuantity() {
    this.quantity.set(this.quantity() + 1);
  };

  decreaseQuantity() {
    const current = this.quantity();
    if (current > 1) {
      this.quantity.set(current - 1);
    };
  }

  addToCart() {
    console.log('addToCart');
  }
}
