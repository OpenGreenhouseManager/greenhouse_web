import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceResponseDto, DeviceStatusResponseDto } from '../../dtos/device';
import { device } from '../../urls/urls';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor(private http: HttpClient) {}

  getAllDevices(): Observable<DeviceResponseDto[]> {
    return this.http.get<DeviceResponseDto[]>(device, {
      withCredentials: true,
    });
  }

  getDeviceStatus(deviceId: string): Observable<DeviceStatusResponseDto> {
    return this.http.get<DeviceStatusResponseDto>(
      `${device}/${deviceId}/status`,
      {
        withCredentials: true,
      }
    );
  }
}
