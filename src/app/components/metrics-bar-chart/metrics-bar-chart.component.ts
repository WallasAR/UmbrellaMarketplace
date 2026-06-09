import { Component, Input } from '@angular/core';

export interface ChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-metrics-bar-chart',
  standalone: false,
  templateUrl: './metrics-bar-chart.component.html',
  styleUrl: './metrics-bar-chart.component.css'
})
export class MetricsBarChartComponent {
  @Input() title = 'Receita por dia';
  @Input() points: ChartPoint[] = [];
  @Input() valuePrefix = 'R$ ';

  maxValue() {
    const max = Math.max(...this.points.map((p) => p.value), 1);
    return max;
  }

  barHeight(value: number) {
    return `${Math.max(8, (value / this.maxValue()) * 100)}%`;
  }
}
