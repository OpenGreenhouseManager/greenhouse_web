import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { AlertService } from './alert.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CardComponent } from "../../card/card.component";
import { combineLatest, of } from 'rxjs';
import { subHours } from 'date-fns';
import { Alert, Severity } from '../../alert/models/alert';

@Component({
  selector: 'grn-alert-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.scss',
})
export class AlertListComponent {
  public dataSourceId = input.required<string>();
  private alertService = inject(AlertService);

  public loading = signal(false);
  public error = signal<string | null>(null);
  
  public startDate = signal(subHours(new Date(), 1));


  // Convert the device signal to an observable, then switch to the timeseries observable
  public alerts = toSignal(
    combineLatest([
      toObservable(this.dataSourceId),
      toObservable(this.startDate),
    ]).pipe(
      switchMap(([deviceConfig, startDate]) => {
        this.loading.set(true);
        this.error.set(null);
        return this.alertService.getAlerts({
          datasource_id: deviceConfig,
          created_at: startDate,
        })
        .pipe(
          catchError(error => {
            this.loading.set(false);
            this.error.set(error.message);
            return of([]);
          })
        )
      })
    ).pipe(
      map(alerts => {
        this.loading.set(false);
        return alerts.map(a => ({
          id: a.id,
          severity: a.severity as unknown as Severity,
          identifier: a.identifier,
          value: a.value,
          note: a.note,
          created_at: new Date(a.created_at),
          datasource_id: a.datasource_id,
        }) satisfies Alert);
      })
    )
  );
}
