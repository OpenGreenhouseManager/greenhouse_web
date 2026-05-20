import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'grn-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  public title = input.required<string>();
  public centerTitle = input<boolean>(false);
  public solid = input<boolean>(false);
  public icon = input<string>();
  public icon_class = computed(() => `pi ${this.icon() ?? ''}`);
  public iconClicked = output();

  public cardStyle = computed(() =>
    this.solid()
      ? {
          width: '100%',
          backgroundColor: 'var(--grn-surface-color)',
          borderRadius: '10px',
          border: '1px solid var(--neutral-200)',
          boxShadow: 'var(--shadow-card)',
        }
      : {
          width: '100%',
          backgroundColor: 'var(--grn-card-color)',
          borderRadius: '10px',
        }
  );
}
