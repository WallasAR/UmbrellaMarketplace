import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  dropdownOpen: string | null = null;
  searchQuery = '';

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.cartService.loadCart();
    }
  }

  toggleDropdown(menu: string): void {
    this.dropdownOpen = this.dropdownOpen === menu ? null : menu;
  }

  closeDropdowns(): void {
    this.dropdownOpen = null;
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/home'], { queryParams: { q: this.searchQuery.trim() } });
      this.closeDropdowns();
    }
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
    this.closeDropdowns();
  }

  logout(): void {
    this.authService.logout();
    this.cartService.data.set([]);
    this.closeDropdowns();
  }
}
