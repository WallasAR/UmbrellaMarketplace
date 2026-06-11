import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService, SearchSuggestions } from '../../services/search.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-search-modal',
  standalone: false,
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements OnInit, OnDestroy, AfterViewInit {
  isOpen = false;
  searchQuery = '';
  history: string[] = [];
  suggestions: SearchSuggestions = { terms: [], products: [], categories: [], brands: [] };
  isLoading = false;
  popularCategories: string[] = [];

  private modalSub!: Subscription;
  private searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private searchService: SearchService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.modalSub = this.searchService.modalState$.subscribe(state => {
      this.isOpen = state;
      if (state) {
        this.loadHistory();
        this.loadPopularCategories();
        setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
      } else {
        this.reset();
      }
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return this.searchService.getSuggestions(query);
      })
    ).subscribe({
      next: (res) => {
        this.suggestions = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    if (this.isOpen) {
      this.searchInput?.nativeElement?.focus();
    }
  }

  ngOnDestroy() {
    if (this.modalSub) this.modalSub.unsubscribe();
  }

  closeModal() {
    this.searchService.closeModal();
  }

  onInput(event: any) {
    const val = event.target.value;
    this.searchQuery = val;
    if (val.length >= 3) {
      this.searchSubject.next(val);
    } else {
      this.suggestions = { terms: [], products: [], categories: [], brands: [] };
    }
  }

  reset() {
    this.searchQuery = '';
    this.suggestions = { terms: [], products: [], categories: [], brands: [] };
  }

  loadHistory() {
    this.searchService.getHistory().subscribe(res => {
      this.history = res;
    });
  }

  search(term: string) {
    if (!term.trim()) return;
    this.searchService.saveHistory(term).subscribe();
    this.router.navigate(['/home'], { queryParams: { q: term } });
    this.closeModal();
  }

  searchByCategory(category: string) {
    this.router.navigate(['/home'], { queryParams: { category } });
    this.closeModal();
  }

  searchByBrand(brand: string) {
    this.router.navigate(['/home'], { queryParams: { laboratory: brand } });
    this.closeModal();
  }

  loadPopularCategories() {
    if (this.popularCategories.length > 0) return;
    this.productService.listCategories().subscribe({
      next: (res) => {
        this.popularCategories = res.slice(0, 6);
      }
    });
  }

  goToPrescription() {
    this.closeModal();
    this.router.navigate(['/prescription']);
  }
}
