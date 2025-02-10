import { Component, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: false,

  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  products: Product[] = [];

  constructor(private http: HttpClient) { this.getProducts() }


  getProducts() {
    this.http.get<Product[]>(`${environment.apiUrl}/product/list`).subscribe((res:Product[]) => {
      this.products = res;
    })
  }

  // products = signal<Product[]> ([
  //   { id: 1, name: 'Produto 1312514332135', img: 'https://www.geolab.com.br/wp-content/uploads/2021/05/Mockup-Gotas-tarja-preta_R2-500x500-1.png', price: 99.99, discount: 10, stock: 2, description: "Produto 1 é indicado para chama papai"},
  //   { id: 2, name: 'Produto 2', img: 'https://www.germedpharma.com.br/wp-content/uploads/2022/11/embalagens_535x490px_controlados_tarja_vermelha.png', price: 149.99, discount: 0, stock: 1235, description: "Produto 1 é indicado para chama papai" },
  //   { id: 3, name: 'Produto 3', img: 'https://www.drogariasbrasil.com/products_images/original/7896862918149.png', price: 79.99, discount: 15, stock: 546, description: "Produto 1 é indicado para chama papai" },
  //   { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, discount: 0, stock: 0,  description: "Produto 1 é indicado para chama papai" },
  //   { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, discount: 0, stock: 224, description: "Produto 1 é indicado para chama papai" },
  //   { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, discount: 0, stock: 2, description: "Produto 1 é indicado para chama papai" },
  //   { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, discount: 0, stock: 2,  description: "Produto 1 é indicado para chama papai" },
  // ]);
}
