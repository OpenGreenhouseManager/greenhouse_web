import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { differenceInSeconds, fromUnixTime, subDays } from 'date-fns';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CardComponent } from '../../card/card.component';
import { chartOptions as defaultChartOptions } from './chart_option';
import { GraphService } from './graph.service';

export interface GraphConfig {
  device_id: string;
  sub_property?: string;
}

const MAX_DATA_POINTS = 100;

@Component({
  selector: 'grn-graph',
  standalone: true,
  imports: [
    CardComponent,
    ChartModule,
    ProgressSpinnerModule,
    MessageModule,
    FormsModule,
    DatePickerModule,
    DialogModule,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
})
export class GraphComponent {
  public config = input.required<GraphConfig>();
  public header = input.required<string>();
  private graphService = inject(GraphService);
  public chartOptions = defaultChartOptions;
  public loading = signal(false);
  public error = signal<string | null>(null);
  public dialogVisible = false;
  public startDate = signal(subDays(new Date(), 1));
  public endDate = signal(new Date());

  // calculate the step size based on the duration and the max data points
  // output should be prometeus steps example 1s, 5s, 10s, 15s, 30s, 1m, 2m, 5m, 10m, 1h, 1d
  public steps = computed(() => {
    const raw_pint_count =
      differenceInSeconds(this.endDate(), this.startDate()) / 5;
    const step_count = raw_pint_count / MAX_DATA_POINTS;

    if (step_count < 1) {
      return '1s';
    } else if (step_count < 60) {
      return Math.floor(step_count) + 's';
    } else if (step_count < 3600) {
      return Math.floor(step_count / 60) + 'm';
    } else if (step_count < 86400) {
      return Math.floor(step_count / 3600) + 'h';
    } else {
      return '1d';
    }
  });

  public now = signal(new Date());

  private isNumberValue(value: unknown): value is {
    Number: number;
  } {
    return !!value && typeof value === 'object' && 'Number' in (value as any);
  }

  private isMeasurementValue(value: unknown): value is {
    Measurement: { value: number; unit: string };
  } {
    return (
      !!value && typeof value === 'object' && 'Measurement' in (value as any)
    );
  }

  // Convert the device signal to an observable, then switch to the timeseries observable
  public timeseries = toSignal(
    combineLatest([
      toObservable(this.config),
      toObservable(this.startDate),
      toObservable(this.endDate),
      toObservable(this.steps),
    ])
      .pipe(
        switchMap(([deviceConfig, startDate, endDate, steps]) => {
          this.loading.set(true);
          this.error.set(null);

          return this.graphService
            .getTimeseries(deviceConfig.device_id, {
              start: startDate,
              end: endDate,
              step: steps,
              sub_property: deviceConfig.sub_property,
            })
            .pipe(
              catchError(error => {
                this.loading.set(false);
                this.error.set(error.message);
                return of({ timeseries: [] });
              })
            );
        })
      )
      .pipe(
        map(timeseries => {
          this.loading.set(false);

          // Derive unit if Measurement data is present
          const measurementEntry = timeseries.timeseries.find(ts =>
            this.isMeasurementValue(ts.value as unknown)
          );
          const entryValue = measurementEntry?.value as unknown;
          const unit =
            entryValue && this.isMeasurementValue(entryValue)
              ? entryValue.Measurement.unit
              : '';

          // Update chart options to display unit on Y axis and tooltips
          this.chartOptions = {
            ...defaultChartOptions,
            scales: {
              ...defaultChartOptions.scales,
              y: {
                ...defaultChartOptions.scales?.y,
                title: unit
                  ? { display: true, text: unit }
                  : { display: false, text: '' },
              },
            },
            plugins: {
              ...defaultChartOptions.plugins,
              tooltip: {
                ...defaultChartOptions.plugins?.tooltip,
                callbacks: {
                  ...(defaultChartOptions.plugins?.tooltip as any)?.callbacks,
                  label: (context: any) => {
                    const value =
                      context?.parsed?.y ??
                      context?.raw ??
                      context?.formattedValue;
                    const dsLabel = context?.dataset?.label
                      ? `${context.dataset.label}: `
                      : '';
                    return `${dsLabel}${value}${unit ? ' ' + unit : ''}`;
                  },
                },
              },
            },
          };

          return {
            labels: timeseries.timeseries.map(t =>
              fromUnixTime(t.timestamp).toLocaleTimeString()
            ),
            datasets: [
              {
                data: timeseries.timeseries.map(t => {
                  const value = t.value as unknown;
                  if (this.isMeasurementValue(value)) {
                    return value.Measurement.value;
                  }
                  if (this.isNumberValue(value)) {
                    return value.Number;
                  }
                  return NaN;
                }),
              },
            ],
          };
        })
      )
  );
}
