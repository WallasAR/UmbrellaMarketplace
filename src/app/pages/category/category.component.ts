import { Component } from '@angular/core';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
  categories = [
    { name: 'Analgésicos', icon: '💊', description: 'Alívio de dores e febre' },
    { name: 'Vitaminas', icon: '🌿', description: 'Suplementos e bem-estar' },
    { name: 'Dermocosméticos', icon: '✨', description: 'Cuidados com a pele' },
    { name: 'Genéricos', icon: '💰', description: 'Mesma qualidade, menor preço' },
    { name: 'Higiene', icon: '🧴', description: 'Produtos de higiene pessoal' },
    { name: 'Infantil', icon: '👶', description: 'Cuidados para bebês e crianças' },
  ];
}
