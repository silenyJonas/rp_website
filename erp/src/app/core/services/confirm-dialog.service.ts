// src/app/core/services/confirm-dialog.service.ts
import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector, EmbeddedViewRef } from '@angular/core';
import { ConfirmDialogComponent } from '../../admin/components/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private componentRef?: ComponentRef<ConfirmDialogComponent>;

  constructor(
    private environmentInjector: EnvironmentInjector, // <-- Inject EnvironmentInjector
    private appRef: ApplicationRef
  ) { }

  open(title: string, message: string): Promise<boolean> {
    this.closeDialog();

    // Dynamically create the component using EnvironmentInjector
    this.componentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.environmentInjector // <-- Pass the injected instance here
    });
    
    // Get the DOM element from the component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // Attach the component to the application's view
    this.appRef.attachView(this.componentRef.hostView);

    // Append the component element to the document body
    document.body.appendChild(domElem);
    
    // Set input properties on the component instance
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
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
  }
}