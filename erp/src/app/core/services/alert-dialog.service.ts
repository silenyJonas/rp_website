import { Injectable, ComponentRef, ApplicationRef, EnvironmentInjector, createComponent, EmbeddedViewRef } from '@angular/core';
import { AlertDialogComponent, AlertType } from '../../admin/components/alert-dialog/alert-dialog.component';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlertDialogService {
  private componentRef?: ComponentRef<AlertDialogComponent>;

  constructor(
    private environmentInjector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {}

  open(title: string, message: string, type: AlertType = 'info'): Promise<void> {
    this.closeDialog();

    this.componentRef = createComponent(AlertDialogComponent, {
      environmentInjector: this.environmentInjector
    });

    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    this.appRef.attachView(this.componentRef.hostView);
    document.body.appendChild(domElem);

    this.componentRef.instance.title = title;
    this.componentRef.instance.message = message;
    this.componentRef.instance.type = type;
    this.componentRef.instance.show();

    return new Promise<void>((resolve) => {
      this.componentRef?.instance.onOk.pipe(first()).subscribe(() => {
        this.closeDialog();
        resolve();
      });
    });
  }

  private closeDialog(): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
  }
}