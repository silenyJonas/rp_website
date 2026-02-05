import { Component, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'info' | 'warning' | 'danger' | 'success';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent implements OnDestroy {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: AlertType = 'info';

  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false;

  show(): void {
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
  }

  public hide(): void {
    this.isVisible = false;
    document.body.style.overflow = 'auto';
  }

  ok(): void {
    this.onOk.emit();
    this.hide();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  getDialogClass(): string {
    switch (this.type) {
      case 'warning': return 'warning-dialog';
      case 'danger': return 'danger-dialog';
      case 'success': return 'success-dialog';
      default: return 'info-dialog';
    }
  }
}