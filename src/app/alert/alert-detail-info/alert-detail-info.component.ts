import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Alert, Severity } from '../models/alert';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { addDays, endOfDay, isSameDay, startOfDay, subDays } from 'date-fns';

@Component({
  selector: 'grn-alert-detail-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    CardModule,
    ChartModule,
  ],
  templateUrl: './alert-detail-info.component.html',
  styleUrl: './alert-detail-info.component.scss',
})
export class AlertDetailInfoComponent implements OnInit {
  data: unknown;
  options: unknown;
  platformId = inject(PLATFORM_ID);

  alerts = input.required<Alert[]>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.initChart();
  }

  getCount(severity: Severity, days: number): number[] {
    const data = [];
    for (
      let currentDay = startOfDay(subDays(Date.now(), days - 1));
      !isSameDay(currentDay, endOfDay(addDays(Date.now(), 1)));
      currentDay.setDate(currentDay.getDate() + 1)
    ) {
      const count = this.alerts().filter(
        alert =>
          alert.severity === severity &&
          isSameDay(new Date(alert.created_at), currentDay)
      ).length;
      data.push(count);
    }
    return data;
  }

  relativeDayNames(days: number): string[] {
    const names = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      names.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return names;
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      const days = 8;

      this.data = {
        labels: this.relativeDayNames(days),
        datasets: [
          {
            type: 'bar',
            label: 'Info',
            backgroundColor: '#0ea5e9',
            data: this.getCount(Severity.Info, days),
          },
          {
            type: 'bar',
            label: 'Warning',
            backgroundColor: '#f97316',
            data: this.getCount(Severity.Warning, days),
          },
          {
            type: 'bar',
            label: 'Error',
            backgroundColor: '#f44336',
            data: this.getCount(Severity.Error, days),
          },
          {
            type: 'bar',
            label: 'Fatal',
            backgroundColor: '#b71c1c',
            data: this.getCount(Severity.Fatal, days),
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
}
