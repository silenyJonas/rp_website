// // import { Component, EventEmitter, Output } from '@angular/core';
// // import { CommonModule } from '@angular/common';

// // @Component({
// //   selector: 'app-confirm-dialog',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './confirm-dialog.component.html',
// //   styleUrls: ['./confirm-dialog.component.css']
// // })
// // export class ConfirmDialogComponent {
// //   title: string = '';
// //   message: string = '';
// //   isVisible: boolean = false;

// //   @Output() onConfirm = new EventEmitter<void>();
// //   @Output() onCancel = new EventEmitter<void>();

// //   show(): void {
// //     this.isVisible = true;
// //   }

// //   hide(): void {
// //     this.isVisible = false;
// //   }

// //   confirm(): void {
// //     this.onConfirm.emit();
// //   }

// //   cancel(): void {
// //     this.onCancel.emit();
// //   }
// // }
// import { Component, EventEmitter, Output, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-confirm-dialog',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './confirm-dialog.component.html',
//   styleUrls: ['./confirm-dialog.component.css']
// })
// export class ConfirmDialogComponent {
//   @Input() title: string = '';
//   @Input() message: string = '';

//   @Output() onConfirm = new EventEmitter<void>();
//   @Output() onCancel = new EventEmitter<void>();

//   isVisible: boolean = false;

//   show(): void {
//     this.isVisible = true;
//     this.blockBackgroundScroll();
//   }

//   hide(): void {
//     this.isVisible = false;
//     this.unblockBackgroundScroll();
//   }

//   confirm(): void {
//     this.onConfirm.emit();
//   }

//   cancel(): void {
//     this.onCancel.emit();
//   }

//   // Nová metoda pro zablokování scrollu
//   private blockBackgroundScroll(): void {
//     document.body.classList.add('no-scroll');
//   }

//   // Nová metoda pro odblokování scrollu
//   private unblockBackgroundScroll(): void {
//     document.body.classList.remove('no-scroll');
//   }
// }

import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() message: string = '';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  isVisible: boolean = false;

  show(): void {
    this.isVisible = true;
    this.blockBackgroundScroll();
  }

  // Metoda hide je nyní veřejná
  public hide(): void {
    this.isVisible = false;
    this.unblockBackgroundScroll();
  }

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }

  // Nová metoda pro zablokování scrollu
  private blockBackgroundScroll(): void {
    document.body.classList.add('no-scroll');
  }

  // Nová metoda pro odblokování scrollu
  private unblockBackgroundScroll(): void {
    document.body.classList.remove('no-scroll');
  }
}
