import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { GraphService } from './graph.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CardComponent } from "../card/card.component";
import { ChartModule } from 'primeng/chart';
import { chartOptions } from './chart_option';
import { of } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

export interface GraphConfig {
  device_id: string;
  sub_property?: string;
}

@Component({
  selector: 'grn-graph',
  standalone: true,
  imports: [CommonModule, CardComponent, ChartModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
})
export class GraphComponent {
  public device = input.required<GraphConfig>();
  private graphService = inject(GraphService);
  public chartOptions = chartOptions;

  public loading = signal(false);
  public error = signal<string | null>(null);
  
  // Convert the device signal to an observable, then switch to the timeseries observable
  public timeseries = toSignal(
    toObservable(this.device).pipe(
      switchMap(deviceConfig => {
        this.loading.set(true);
        return this.graphService.getTimeseries(deviceConfig.device_id, {
          start: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
          end: new Date(),
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
      map(timeseries => {
        this.loading.set(false);
        return {
          labels: timeseries.map(t => new Date(t.timestamp).toLocaleTimeString()),
          datasets: [{
            data: timeseries.map(t => (t.value as { Number: number }).Number)
          }]
        }
      })
    )
  );

  public e = effect(() => {
    console.log(this.timeseries());
  });
}
