import { Component } from '@angular/core';
import {
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterModule,
} from 'angular-gridster2';
import { NavBarComponent } from '../nav_bar/nav_bar.component';
import { AlertListComponent } from '../shared/alert/alert-list.component';
import { GraphComponent, GraphConfig } from '../shared/graph/graph.component';

// Define discriminated union types for dashboard items
interface GraphDashboardItem extends GridsterItem {
  type: 'graph';
  options: GraphConfig;
}

interface AlertListDashboardItem extends GridsterItem {
  type: 'alertList';
  options: {
    dataSourceId: string;
  };
}

// Union type for all dashboard items
type DashboardItem = GraphDashboardItem | AlertListDashboardItem;

@Component({
  selector: 'grn-dashboard',
  standalone: true,
  imports: [
    NavBarComponent,
    GridsterModule,
    GridsterItemComponent,
    GraphComponent,
    AlertListComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  options: GridsterConfig;
  dashboard: DashboardItem[];

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
        rows: 3,
        y: 0,
        x: 0,
        type: 'graph',
        options: {
          device_id: '286cbd49-1aed-463e-a37f-3c2e677ad66d',
          sub_property: 'temperature',
        },
      },
      {
        cols: 3,
        rows: 2,
        y: 0,
        x: 3,
        type: 'alertList',
        options: {
          dataSourceId: '7a224a14-6e07-45a3-91da-b7584a5731c1',
        },
      },
    ];
  }
}
