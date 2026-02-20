
import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector, EmbeddedViewRef } from '@angular/core';
import { ConfirmDialogComponent } from '../../admin/components/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private componentRef?: ComponentRef<ConfirmDialogComponent>;

  constructor(
    private environmentInjector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) { }

  open(title: string, message: string): Promise<boolean> {
    this.closeDialog();
    this.componentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.environmentInjector
    });
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    this.appRef.attachView(this.componentRef.hostView);
    document.body.appendChild(domElem);
    this.componentRef.instance.title = title;
    this.componentRef.instance.message = message;
    this.componentRef.instance.show();
    return new Promise<boolean>((resolve) => {
      this.componentRef?.instance.onConfirm.pipe(first()).subscribe(() => {
        this.closeDialog();
        resolve(true);
      });

      this.componentRef?.instance.onCancel.pipe(first()).subscribe(() => {
        this.closeDialog();
        resolve(false);
      });
    });
  }

  private closeDialog(): void {
    if (this.componentRef) {
      this.componentRef.instance.hide();
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
  }
}
