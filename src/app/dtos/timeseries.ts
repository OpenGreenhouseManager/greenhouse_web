export interface TimeseriesDto {
  timestamp: number;
  value: Type;
}

export interface Measurement {
  value: number;
  unit: string;
}

export type Type =
  | { Number: number }
  | { Boolean: boolean }
  | { Object: Record<string, Type> }
  | { Measurement: Measurement }
  | { Array: Type[] };

export interface TimeseriesResponseDto {
  timeseries: TimeseriesDto[];
}
