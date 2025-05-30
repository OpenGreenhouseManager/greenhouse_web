import { Severity } from './alert';

export interface AlertAggrigatedDto {
  count: number;
  identifier: string;
  severity: Severity;
  source: string;
  first: string;
  last: string;
}
