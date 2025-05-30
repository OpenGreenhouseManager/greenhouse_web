export enum Severity {
  Info,
  Warning,
  Error,
  Fatal,
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
