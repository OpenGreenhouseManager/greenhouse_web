import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { environment } from '../environments/environment';

@Component({
  selector: 'grn-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public str: string = $localize`:@@HOME-TEXT1:Add some content to get startedd!`;
  public str2: string = $localize`:@@HOME-TEXT2:this is some more localization!`;

  constructor() {
    console.log(environment.production); // Logs false for development environment
    console.log('using api: ' + environment.baseUrl);
  }

  title = 'greenhouse_web';
}
