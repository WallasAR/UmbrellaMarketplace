import { Component } from '@angular/core';
import { Product } from '../models/card.model';

@Component({
  selector: 'app-home',
  standalone: false,

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  products: Product[] = [
    { id: 1, name: 'Produto 1312514332135', img: 'https://www.geolab.com.br/wp-content/uploads/2021/05/Mockup-Gotas-tarja-preta_R2-500x500-1.png', price: 99.99, discount: 10, description: "Produto 1 é indicado para chama papai"},
    { id: 2, name: 'Produto 2', img: 'https://www.germedpharma.com.br/wp-content/uploads/2022/11/embalagens_535x490px_controlados_tarja_vermelha.png', price: 149.99, description: "Produto 1 é indicado para chama papai" },
    { id: 3, name: 'Produto 3', img: 'https://www.drogariasbrasil.com/products_images/original/7896862918149.png', price: 79.99, discount: 15, description: "Produto 1 é indicado para chama papai" },
    { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, description: "Produto 1 é indicado para chama papai" },
    { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, description: "Produto 1 é indicado para chama papai" },
    { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, description: "Produto 1 é indicado para chama papai" },
    { id: 4, name: 'Produto 4', img: 'https://dmvfarma.vtexassets.com/arquivos/ids/245386-500-auto?v=638561440448470000&width=500&height=auto&aspect=true', price: 199.99, description: "Produto 1 é indicado para chama papai" },
  ];
}
