import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert-service';
import { endOfDay, startOfDay, subDays, subHours } from 'date-fns';
import { AggregatedAlert, Severity } from '../models/aggregated-alert';
import { AlertInterval } from '../models/alert-interval';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { NavBarComponent } from '../../nav_bar/nav_bar.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'grn-alert-overview',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    FormsModule,
    MultiSelectModule,
    SelectModule,
    CommonModule,
    NavBarComponent,
    DropdownModule,
  ],
  templateUrl: './alert-overview.component.html',
  styleUrl: './alert-overview.component.scss',
})
export class AlertOverviewComponent implements OnInit {
  alerts = signal<AggregatedAlert[]>([]);
  alerts_effect = effect(() => {
    this.alertService
      .getAlerts(
        this.intervalToDate(
          AlertInterval[
            this.selectedInterval().value as keyof typeof AlertInterval
          ] as AlertInterval
        ),
        endOfDay(new Date())
      )
      .subscribe(value => {
        this.alerts.set(value);
      });
  });
  intervals = Object.keys(AlertInterval)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: AlertInterval[key as keyof typeof AlertInterval],
      value: key,
    }));
  selectedInterval = signal(this.intervals[0]);
  selectedSeverity: Severity | null = null;
  severityOptions = Object.keys(Severity)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: key,
    }));

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {}

  intervalToDate(interval: AlertInterval): Date {
    switch (interval) {
      case AlertInterval.last_1_hour:
        return subHours(new Date(), 1);
      case AlertInterval.last_24_hours:
        return subDays(new Date(), 1);
      case AlertInterval.last_7_days:
        return startOfDay(subDays(new Date(), 7));
      case AlertInterval.last_14_days:
        return startOfDay(subDays(new Date(), 14));
      case AlertInterval.last_30_days:
        return startOfDay(subDays(new Date(), 30));
      case AlertInterval.last_90_days:
        return startOfDay(subDays(new Date(), 90));
      case AlertInterval.absolute:
        return startOfDay(new Date());
    }
  }

  prittyDate(date: Date): string {
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  shortenUUID(identifier: string): string {
    const maxLength = 17;
    if (identifier.length <= maxLength) {
      return identifier;
    }
    return identifier.substring(0, maxLength - 3) + '...';
  }
}
