export enum Severity {
  Info,
  Warning,
  Error,
  Fatal,
}

export interface AggregatedAlert {
  count: number;
  identifier: string;
  severity: Severity;
  source: string;
  first: Date;
  last: Date;
}
