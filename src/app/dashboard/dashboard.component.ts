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

const defaultDashboard: DashboardItem[] = [
  {
    cols: 5,
    rows: 4,
    y: 0,
    x: 0,
    type: 'graph',
    options: {
      device_id: '286cbd49-1aed-463e-a37f-3c2e677ad66d',
      sub_property: 'temperature',
    },
  },
  {
    cols: 5,
    rows: 4,
    y: 0,
    x: 5,
    type: 'graph',
    options: {
      device_id: '286cbd49-1aed-463e-a37f-3c2e677ad66d',
      sub_property: 'temperature',
    },
  },
  {
    cols: 5,
    rows: 4,
    y: 0,
    x: 10,
    type: 'graph',
    options: {
      device_id: '286cbd49-1aed-463e-a37f-3c2e677ad66d',
      sub_property: 'temperature',
    },
  },
  {
    cols: 5,
    rows: 4,
    y: 4,
    x: 0,
    type: 'graph',
    options: {
      device_id: '286cbd49-1aed-463e-a37f-3c2e677ad66d',
      sub_property: 'temperature',
    },
  },
];

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
        stop: this.saveDashboard.bind(this), // called after drag
      },
      resizable: {
        enabled: true,
        stop: this.saveDashboard.bind(this), // called after resize
      },
      pushResizeItems: true,

      swap: true,
      minCols: 16,
      minRows: 9,
      maxCols: 16,
      maxRows: 9,
    };

    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      console.log('loading dashboard');
      console.log(savedLayout);
      this.dashboard = JSON.parse(savedLayout);
    } else {
      console.log('no saved dashboard, using default');
      this.dashboard = defaultDashboard;
    }
  }

  saveDashboard(e: any) {
    setTimeout(() => {
      localStorage.setItem('dashboard-layout', JSON.stringify(this.dashboard));
    }, 300);
  }
}
