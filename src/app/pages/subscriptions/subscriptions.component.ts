import { Component, OnInit } from '@angular/core';
import { Subscription, SubscriptionService } from '../../services/subscription.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-subscriptions',
  standalone: false,
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  loading = true;

  constructor(
    private subscriptionService: SubscriptionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.subscriptionService.list().subscribe({
      next: (items) => {
        this.subscriptions = items;
        this.loading = false;
      },
      error: () => {
        this.subscriptions = [];
        this.loading = false;
      }
    });
  }

  cancel(id: string) {
    this.subscriptionService.cancel(id).subscribe({
      next: () => {
        this.toast.show('Assinatura cancelada.', 'success');
        this.ngOnInit();
      }
    });
  }
}
