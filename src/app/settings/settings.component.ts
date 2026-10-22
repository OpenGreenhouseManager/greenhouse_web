import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { CardComponent } from '../card/card.component';
import { GenerateOneTimeTokenRequestDto } from '../dtos/generate_one_time_token_request';
import { NavBarComponent } from '../nav_bar/nav_bar.component';
import { otp } from '../urls/urls';

enum SettingsTabs {
  Dashboard,
  Watchdog,
  AdminSettings,
}

@Component({
  selector: 'grn-settings',
  imports: [
    NavBarComponent,
    CommonModule,
    CardComponent,
    FormsModule,
    InputTextModule,
    ButtonDirective,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  currentTab: SettingsTabs = SettingsTabs.Dashboard;
  settingsTabs = SettingsTabs;
  otpUsername = '';
  otp = signal('');
  isCopied = signal(false);

  private http = inject(HttpClient);

  changeTab(tab: SettingsTabs) {
    this.currentTab = tab;
  }

  RequestOtp() {
    this.isCopied.set(false);
    this.http
      .post<string>(otp, new GenerateOneTimeTokenRequestDto(this.otpUsername), {
        withCredentials: true,
      })
      .subscribe({
        next: d => {
          this.otp.set(d);
        },
        error: () => {
          this.otp.set('error');
        },
      });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.otp());
    this.isCopied.set(true);
  }
}
