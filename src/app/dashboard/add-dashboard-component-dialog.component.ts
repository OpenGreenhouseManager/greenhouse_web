import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

export interface DashboardComponentCreate {
  type: 'graph' | 'alertList';
  deviceId?: string;
  subProperty?: string;
  dataSourceId?: string;
  name: string;
}

@Component({
  selector: 'grn-add-dashboard-component-dialog',
  standalone: true,
  imports: [Dialog, Button, Select, InputText, FormsModule],
  template: `
    <p-dialog
      header="Add Dashboard Component"
      [modal]="true"
      [visible]="visibleSignal()"
      class="w-full"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      (onHide)="onCloseDialog()">
      <div class="flex items-center gap-4 mb-4 w-full">
        <label for="componentType" class="font-semibold w-24"
          >Component Type</label
        >
        <p-select
          id="componentType"
          [options]="['graph', 'alertList']"
          [(ngModel)]="selectedComponentType"
          [appendTo]="'body'"
          class="w-full" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Name</label>
        <input pInputText id="name" [(ngModel)]="name" />
      </div>

      @if (selectedComponentType === 'graph') {
        <div class="flex items-center gap-4 mb-4">
          <label for="deviceId" class="font-semibold w-24">Device ID</label>
          <input pInputText id="deviceId" [(ngModel)]="deviceId" />
        </div>

        <div class="flex items-center gap-4 mb-4">
          <label for="subProperty" class="font-semibold w-24"
            >Sub Property</label
          >
          <input pInputText id="subProperty" [(ngModel)]="subProperty" />
        </div>
      }

      @if (selectedComponentType === 'alertList') {
        <div class="flex items-center gap-4 mb-4">
          <label for="dataSourceId" class="font-semibold w-24"
            >Data Source ID</label
          >
          <input pInputText id="dataSourceId" [(ngModel)]="dataSourceId" />
        </div>
      }

      <div class="flex justify-end gap-2 mt-6">
        <p-button
          label="Cancel"
          severity="secondary"
          (click)="onCloseDialog()" />
        <p-button
          label="Add Component"
          [disabled]="!isFormValid()"
          (click)="onSave()" />
      </div>
    </p-dialog>
  `,
})
export class AddDashboardComponentDialogComponent {
  visible = input<boolean>(false);
  visibleSignal = signal(this.visible());
  dialogClose = output<void>();
  componentAdded = output<DashboardComponentCreate>();

  selectedComponentType: 'graph' | 'alertList' = 'graph';
  deviceId = '';
  subProperty = '';
  dataSourceId = '';
  name = '';

  constructor() {
    effect(() => {
      this.visibleSignal.set(this.visible());
      if (this.visible()) {
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.selectedComponentType = 'graph';
    this.deviceId = '';
    this.subProperty = '';
    this.dataSourceId = '';
    this.name = '';
  }

  isFormValid(): boolean {
    if (!this.selectedComponentType) return false;

    if (!this.name) return false;

    if (this.selectedComponentType === 'graph') {
      return this.deviceId.trim() !== '';
    }

    if (this.selectedComponentType === 'alertList') {
      return this.dataSourceId.trim() !== '';
    }

    return false;
  }

  onCloseDialog() {
    this.dialogClose.emit();
    this.visibleSignal.set(false);
  }

  onSave() {
    if (!this.isFormValid()) return;

    const component: DashboardComponentCreate = {
      type: this.selectedComponentType!,
      name: this.name.trim(),
    };

    if (this.selectedComponentType === 'graph') {
      component.deviceId = this.deviceId.trim();
      component.subProperty = this.subProperty.trim();
    } else if (this.selectedComponentType === 'alertList') {
      component.dataSourceId = this.dataSourceId.trim();
    }

    this.componentAdded.emit(component);
    this.onCloseDialog();
  }
}
