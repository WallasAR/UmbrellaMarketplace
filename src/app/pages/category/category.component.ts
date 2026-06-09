import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

interface CategoryCard {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  categories: CategoryCard[] = [];

  private defaults: CategoryCard[] = [
    { name: 'Analgésicos', icon: 'RX', description: 'Alívio de dores e febre' },
    { name: 'Vitaminas', icon: 'VT', description: 'Suplementos e bem-estar' },
    { name: 'Dermocosméticos', icon: 'DC', description: 'Cuidados com a pele' },
    { name: 'Genéricos', icon: 'GN', description: 'Mesma qualidade, menor preço' },
    { name: 'Higiene', icon: 'HG', description: 'Produtos de higiene pessoal' },
    { name: 'Infantil', icon: 'IF', description: 'Cuidados para bebês e crianças' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (apiCategories) => {
        this.categories = apiCategories.length
          ? apiCategories.map((name) => ({ name, icon: name.slice(0, 2).toUpperCase(), description: `Medicamentos de ${name}` }))
          : this.defaults;
      },
      error: () => this.categories = this.defaults
    });
  }
}
