import { Component, OnInit } from '@angular/core';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
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
      paid: 'Pago'
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
