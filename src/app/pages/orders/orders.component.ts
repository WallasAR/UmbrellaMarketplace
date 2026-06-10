import { Component, OnInit } from '@angular/core';
import { Order, OrderGroup } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  orderGroups: OrderGroup[] = [];
  viewMode: 'all' | 'groups' = 'all';
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  setViewMode(mode: 'all' | 'groups') {
    this.viewMode = mode;
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;

    if (this.viewMode === 'groups') {
      this.orderService.listOrderGroups().subscribe({
        next: (groups) => {
          this.orderGroups = groups.filter((g) => g.session_count > 0);
          this.loading = false;
        },
        error: () => {
          this.orderGroups = [];
          this.loading = false;
        }
      });
      return;
    }

    this.orderService.listOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.loading = false;
      }
    });
  }

  statusLabel(status: string) {
    const map: Record<string, string> = {
      pending_payment: 'Aguardando pagamento',
      processing: 'Em processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      paid: 'Pago',
      partial: 'Parcialmente pago'
    };
    return map[status] || status;
  }

  deliveryStatusLabel(status: string) {
    const map: Record<string, string> = {
      pending: 'Aguardando despacho',
      awaiting_driver: 'Aguardando motorista',
      picked_up: 'Coletado na farmácia',
      in_transit: 'A caminho',
      delivered: 'Entregue',
      cancelled: 'Cancelada'
    };
    return map[status] || status;
  }

  pickupStatusLabel(status: string) {
    const map: Record<string, string> = {
      ready: 'Pronto para retirada',
      picked_up: 'Retirado',
      expired: 'Expirado'
    };
    return map[status] || status;
  }
}
