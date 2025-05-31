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
import { SortEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
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
    ButtonModule,
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

  display(identifier: string): string {
    const alias = this.searchForAlias(identifier);
    if (alias) {
      return alias;
    }

    const maxLength = 16;
    if (identifier.length <= maxLength) {
      return identifier;
    }
    return identifier.substring(0, maxLength - 3) + '...';
  }

  searchForAlias(identifier: string): string | null {
    return localStorage.getItem(`alias_${identifier}`);
  }

  editAlias(identifier: string) {
    const alias = this.searchForAlias(identifier);
    const newAlias = prompt('Edit Alias', alias || '');
    if (newAlias !== null) {
      if (newAlias.trim() === '') {
        localStorage.removeItem(`alias_${identifier}`);
      } else {
        localStorage.setItem(`alias_${identifier}`, newAlias);
      }
    }
  }

  severityToColor(severity: string): string {
    const a = Severity[severity as keyof typeof Severity];
    switch (a) {
      case Severity.Info:
        return 'info';
      case Severity.Warning:
        return 'warn';
      case Severity.Error:
        return 'error';
      case Severity.Fatal:
        return 'fatal';
      default:
        return 'gray';
    }
  }

  customSort(event: SortEvent) {
    event.data!.sort((data1, data2) => {
      let value1 = data1[event.field!];
      let value2 = data2[event.field!];

      if (event.field! == 'severity') {
        value1 = Severity[value1 as keyof typeof Severity];
        value2 = Severity[value2 as keyof typeof Severity];
      }
      const result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      return event.order! * result;
    });
  }
}
