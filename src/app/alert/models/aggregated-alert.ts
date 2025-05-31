export enum Severity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Fatal = 3,
}

export interface AggregatedAlert {
  count: number;
  identifier: string;
  severity: Severity;
  source: string;
  first: Date;
  last: Date;
}
