import { Severity } from './alert';

export interface AlertQuery {
  severity?: Severity;
  identifier?: string;
  created_at?: string;
  datasource_id?: string;
}
