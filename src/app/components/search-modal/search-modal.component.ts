import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService, SearchSuggestions } from '../../services/search.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  suggestions: SearchSuggestions = { terms: [], products: [] };
  isLoading = false;

  private modalSub!: Subscription;
  private searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    this.modalSub = this.searchService.modalState$.subscribe(state => {
      this.isOpen = state;
      if (state) {
        this.loadHistory();
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
      this.suggestions = { terms: [], products: [] };
    }
  }

  reset() {
    this.searchQuery = '';
    this.suggestions = { terms: [], products: [] };
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

  goToPrescription() {
    this.closeModal();
    this.router.navigate(['/prescription']);
  }
}
