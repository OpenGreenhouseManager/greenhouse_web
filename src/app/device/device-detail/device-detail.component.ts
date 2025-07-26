import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../card/card.component';
import { DeviceService } from '../services/device-service';
import { DeviceResponseDto, ConfigResponseDto } from '../../dtos/device';
import { catchError, forkJoin, of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { NavBarComponent } from '../../nav_bar/nav_bar.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, ProgressSpinnerModule, MessageModule, NavBarComponent, NgxJsonViewerModule],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss'
})
export class DeviceDetailComponent implements OnInit {
  device: DeviceResponseDto | null = null;
  deviceConfig: ConfigResponseDto | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    const deviceId = this.route.snapshot.paramMap.get('id');
    if (deviceId) {
      this.loadDeviceData(deviceId);
    } else {
      this.error = 'Device ID not found';
      this.loading = false;
    }
  }

  private loadDeviceData(deviceId: string): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      device: this.deviceService.getDeviceById(deviceId).pipe(
        catchError(error => {
          console.error('Error loading device:', error);
          return of(null);
        })
      ),
      config: this.deviceService.getDeviceConfig(deviceId).pipe(
        catchError(error => {
          console.error('Error loading device config:', error);
          return of(null);
        })
      )
    }).subscribe({
      next: (result) => {
        this.device = result.device;
        this.deviceConfig = result.config;
        this.loading = false;
        
        if (!result.device && !result.config) {
          this.error = 'Failed to load device data';
        }
      },
      error: (error) => {
        console.error('Error loading device data:', error);
        this.error = 'An error occurred while loading device data';
        this.loading = false;
      }
    });
  }
} 