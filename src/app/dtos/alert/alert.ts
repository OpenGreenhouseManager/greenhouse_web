export enum Severity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Fatal = 3,
}

export interface AlertDto {
  id: string;
  severity: Severity;
  identifier: string;
  value: string;
  note?: string;
  created_at: string;
  datasource_id: string;
}
