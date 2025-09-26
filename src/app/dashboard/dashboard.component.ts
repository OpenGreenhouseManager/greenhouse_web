import { Component } from '@angular/core';
import { NavBarComponent } from '../nav_bar/nav_bar.component';

@Component({
  selector: 'grn-dashboard',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  options: GridsterConfig;
  dashboard: Array<
    GridsterItem & {
      title: string;
      icon: string;
      lastSeen: string;
      firstSeen: string;
      data: any;
      options: any;
    }
  >;

  constructor() {
    this.options = {
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      pushItems: true,
      swap: true,
      minCols: 6,
      minRows: 6,
      maxCols: 12,
      maxRows: 12,
    };

    this.dashboard = [
      {
        cols: 3,
        rows: 2,
        y: 0,
        x: 0,
        title: 'Alert Triggers',
        icon: 'pi pi-bell',
        lastSeen: '2025-09-26 14:00',
        firstSeen: '2025-09-20 10:00',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{ label: 'Alerts', data: [10, 5, 8] }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      },
    ];
  }
}
