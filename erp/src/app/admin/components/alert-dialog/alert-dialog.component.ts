import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define the available alert types
export type AlertType = 'info' | 'warning' | 'danger' | 'success';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: AlertType = 'info';

  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false;

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  ok(): void {
    this.onOk.emit();
  }

  // Helper method to get the correct CSS class based on alert type
  getDialogClass(): string {
    switch (this.type) {
      case 'warning':
        return 'warning-dialog';
      case 'danger':
        return 'danger-dialog';
      case 'success':
        return 'success-dialog';
      case 'info':
      default:
        return 'info-dialog';
    }
  }
}