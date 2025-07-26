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
