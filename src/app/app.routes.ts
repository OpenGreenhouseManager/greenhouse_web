import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { DiaryOverviewComponent } from './diary/diary-overview/diary-overview.component';
import { DiaryDetailComponent } from './diary/diary-detail/diary-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // home route protected by auth guard
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'smart_devices',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'alerts',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'diary',
    component: DiaryOverviewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'diary/add',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'diary/:id',
    component: DiaryDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'diary/:id/edit',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'scripts',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'logout',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  // otherwise redirect to home
];
