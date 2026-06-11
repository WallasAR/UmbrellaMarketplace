import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../services/favorite.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-favorites',
  standalone: false,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  favorites: Product[] = [];
  isLoading = true;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;
    this.favoriteService.list().subscribe({
      next: (data) => {
        // Map the backend response which has the Medicine object nested
        this.favorites = data.map(item => item.Medicine).filter(m => m != null);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
