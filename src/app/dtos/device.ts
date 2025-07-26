export interface DeviceResponseDto {
  id: string;
  name: string;
  address: string;
  description: string;
  canscript: boolean;
  status?: DeviceStatusDto;
}

export enum DeviceStatusDto {
  Online = 'Online',
  Panic = 'Panic',
}

export interface DeviceStatusResponseDto {
  status: DeviceStatusDto;
  datasource_id: string;
}

export enum Mode {
  Input = 'Input',
  Output = 'Output',
  InputOutput = 'InputOutput',
  Unknown = 'Unknown',
}

export interface ConfigResponseDto<T = any> {
  mode: Mode;
  input_type?: Type;
  output_type?: Type;
  additional_config: T;
}

export enum Type {
  Number = 'Number',
  String = 'String',
  Stream = 'Stream',
}
