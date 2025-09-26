import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SortEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Alert, Severity } from '../models/alert';

@Component({
  selector: 'grn-alert-detail-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './alert-detail-list.component.html',
  styleUrl: './alert-detail-list.component.scss',
})
export class AlertDetailListComponent {
  Severity = Severity;
  alerts = input.required<Alert[]>();

  selectedSeverity: Severity | null = null;
  severityOptions = Object.keys(Severity)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: Severity[key as keyof typeof Severity],
      value: key,
    }));

  customSort(event: SortEvent) {
    event.data!.sort((data1, data2) => {
      const value1 = data1[event.field!];
      const value2 = data2[event.field!];

      const result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      return event.order! * result;
    });
  }

  severityToColor(severity: Severity) {
    switch (severity) {
      case Severity.Info:
        return 'info';
      case Severity.Warning:
        return 'warn';
      case Severity.Error:
        return 'warn';
      case Severity.Fatal:
        return 'warn';
      default:
        return 'warn';
    }
  }

  prettyDate(date: Date): string {
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  severityToString(
    severity: unknown
  ): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    if (typeof severity !== 'number') {
      if (severity === 'Warning') {
        return 'warn';
      }
      return 'warn';
    }
    switch (severity) {
      case Severity.Info:
        return 'info';
      case Severity.Warning:
        return 'warn';
      case Severity.Error:
        return 'warn';
      case Severity.Fatal:
        return 'warn';
      default:
        return 'warn';
    }
  }
}
