// // import { Component, EventEmitter, Output, Input } from '@angular/core';
// // import { CommonModule } from '@angular/common';

// // // Define the available alert types
// // export type AlertType = 'info' | 'warning' | 'danger' | 'success';

// // @Component({
// //   selector: 'app-alert-dialog',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './alert-dialog.component.html',
// //   styleUrls: ['./alert-dialog.component.css']
// // })
// // export class AlertDialogComponent {
// //   @Input() title: string = '';
// //   @Input() message: string = '';
// //   @Input() type: AlertType = 'info';

// //   @Output() onOk = new EventEmitter<void>();

// //   isVisible: boolean = false;

// //   show(): void {
// //     this.isVisible = true;
// //   }

// //   hide(): void {
// //     this.isVisible = false;
// //   }

// //   ok(): void {
// //     this.onOk.emit();
// //   }

// //   // Helper method to get the correct CSS class based on alert type
// //   getDialogClass(): string {
// //     switch (this.type) {
// //       case 'warning':
// //         return 'warning-dialog';
// //       case 'danger':
// //         return 'danger-dialog';
// //       case 'success':
// //         return 'success-dialog';
// //       case 'info':
// //       default:
// //         return 'info-dialog';
// //     }
// //   }
// // }

// import { Component, EventEmitter, Output, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// // Define the available alert types
// export type AlertType = 'info' | 'warning' | 'danger' | 'success';

// @Component({
//   selector: 'app-alert-dialog',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './alert-dialog.component.html',
//   styleUrls: ['./alert-dialog.component.css']
// })
// export class AlertDialogComponent {
//   @Input() title: string = '';
//   @Input() message: string = '';
//   @Input() type: AlertType = 'info';

//   @Output() onOk = new EventEmitter<void>();

//   isVisible: boolean = false;

//   show(): void {
//     this.isVisible = true;
//     this.blockBackgroundScroll();
//   }

//   hide(): void {
//     this.isVisible = false;
//     this.unblockBackgroundScroll();
//   }

//   ok(): void {
//     this.onOk.emit();
//   }

//   // Helper method to get the correct CSS class based on alert type
//   getDialogClass(): string {
//     switch (this.type) {
//       case 'warning':
//         return 'warning-dialog';
//       case 'danger':
//         return 'danger-dialog';
//       case 'success':
//       case 'info':
//       default:
//         return 'info-dialog';
//     }
//   }

//   // New method to block background scrolling
//   private blockBackgroundScroll(): void {
//     document.body.classList.add('no-scroll');
//   }

//   // New method to unblock background scrolling
//   private unblockBackgroundScroll(): void {
//     document.body.classList.remove('no-scroll');
//   }
// }

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
    this.blockBackgroundScroll();
  }

  // Metoda hide je nyní veřejná, aby k ní měla přístup služba.
  public hide(): void {
    this.isVisible = false;
    this.unblockBackgroundScroll();
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
      case 'info':
      default:
        return 'info-dialog';
    }
  }

  // New method to block background scrolling
  private blockBackgroundScroll(): void {
    document.body.classList.add('no-scroll');
  }

  // New method to unblock background scrolling
  private unblockBackgroundScroll(): void {
    document.body.classList.remove('no-scroll');
  }
}
