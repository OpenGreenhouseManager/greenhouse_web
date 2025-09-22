import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { AlertListComponent } from './alert-list.component';

describe('AlertListComponent', () => {
  let component: AlertListComponent;
  let fixture: ComponentFixture<AlertListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertListComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('device', {
      id: '1',
      name: 'test',
      address: 'test',
      description: 'test',
      canscript: true,
      scraping: true,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
