import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { LayoutChromeService } from '../../services/layout-chrome.service';
import { NotificationService } from '../../services/notification.service';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../services/user.service';
import { NavbarConfig, visibleLinks } from '../../utils/layout-chrome.util';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnChanges {
  @Input() config: NavbarConfig | null = null;
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';

  dropdownOpen: string | null = null;
  searchQuery = '';
  displayConfig: NavbarConfig;
  userAddress: string | null = null;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private notificationService: NotificationService,
    private searchService: SearchService,
    private chromeService: LayoutChromeService,
    private userService: UserService,
    private router: Router
  ) {
    this.displayConfig = this.chromeService.navbar;
  }

  ngOnInit() {
    this.syncConfig();
    if (!this.config && !this.previewMode) {
      this.chromeService.navbar$.subscribe((cfg) => {
        this.displayConfig = cfg;
      });
    }
    if (this.authService.isAuthenticated() && !this.previewMode) {
      this.cartService.loadCart();
      this.notificationService.load();
      this.userService.getProfile().subscribe({
        next: (profile) => {
          if (profile && profile.address) {
            this.userAddress = profile.address;
          }
        },
        error: () => {}
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.syncConfig();
    }
  }

  get cfg(): NavbarConfig {
    return this.displayConfig;
  }

  visibleCategoryLinks() {
    return visibleLinks(this.cfg.category_links);
  }

  linkClasses(link: { highlight?: boolean }): Record<string, boolean> {
    const highlighted = link.highlight === true;
    return {
      'whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border': true,
      'hover:text-white': highlighted,
      'hover:border-gray-300 hover:bg-gray-50': !highlighted,
      'text-xs font-medium text-gray-600 bg-white border-gray-200': !highlighted,
      'text-brand bg-brand-soft border-brand-soft': highlighted
    };
  }

  linkStyle(link: { highlight?: boolean }): Record<string, string> {
    if (link.highlight !== true) return {};
    return {
      color: this.accentColor,
      backgroundColor: `${this.accentColor}15`,
      borderColor: `${this.accentColor}15`
    };
  }

  private syncConfig() {
    this.displayConfig = this.config || this.chromeService.navbar;
  }

  toggleDropdown(menu: string): void {
    if (this.previewMode) return;
    this.dropdownOpen = this.dropdownOpen === menu ? null : menu;
  }

  closeDropdowns(): void {
    this.dropdownOpen = null;
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
  }

  search(): void {
    if (this.previewMode) return;
    this.searchService.openModal();
  }

  goToCart(): void {
    if (this.previewMode) return;
    this.router.navigate(['/cart']);
    this.closeDropdowns();
  }

  logout(): void {
    if (this.previewMode) return;
    this.authService.logout();
    this.cartService.data.set([]);
    this.notificationService.items.set([]);
    this.closeDropdowns();
  }

  navigate(url: string): void {
    if (this.previewMode) return;
    this.router.navigateByUrl(url);
  }
}
