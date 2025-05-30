import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AggregatedAlert } from '../models/aggregated-alert';
import { map, Observable } from 'rxjs';
import { AlertAggrigatedDto } from '../../dtos/alert/aggrigated-alert';
import { IntervalQuery } from '../../dtos/alert/interval-query';
import { alert } from '../../urls/urls';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private http: HttpClient) {}

  getAlerts(start: Date, end: Date): Observable<AggregatedAlert[]> {
    const query: IntervalQuery = {
      start: start.toISOString(),
      end: end.toISOString(),
    };

    return this.http
      .get<AlertAggrigatedDto[]>(alert, {
        withCredentials: true,
        params: query as HttpParams,
      })
      .pipe(
        map(x => {
          const a: AggregatedAlert[] = [];
          for (let i = 0; i < x.length; i++) {
            const alert = x[i];
            a.push({
              count: alert.count,
              identifier: alert.identifier,
              severity: alert.severity,
              source: alert.source,
              first: new Date(alert.first),
              last: new Date(alert.last),
            });
          }
          return a;
        })
      );
  }
}
