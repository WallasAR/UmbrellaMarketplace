import { Component, input, OnInit } from '@angular/core';
import { Review, ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-reviews',
  standalone: false,
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css'
})
export class ProductReviewsComponent implements OnInit {
  medicineId = input.required<number>();
  pharmacyId = input<string | undefined>();

  reviews: Review[] = [];
  average = 0;
  count = 0;
  rating = 5;
  comment = '';
  loading = false;

  constructor(
    private reviewService: ReviewService,
    public authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.reviewService.getProductReviews(this.medicineId()).subscribe({
      next: (res) => {
        this.reviews = res.reviews;
        this.average = res.summary.average;
        this.count = res.summary.count;
      }
    });
  }

  submitReview() {
    if (!this.authService.getToken()) return;
    this.loading = true;
    this.reviewService.addReview({
      medicine_id: this.medicineId(),
      rating: this.rating,
      comment: this.comment,
      pharmacy_id: this.pharmacyId()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.comment = '';
        this.toast.show('Avaliação enviada.', 'success');
        this.load();
      },
      error: () => { this.loading = false; }
    });
  }
}
