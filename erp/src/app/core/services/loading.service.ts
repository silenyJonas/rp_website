import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading$.asObservable();

  get isLoadingSnapshot(): boolean {
    return this._isLoading$.value;
  }

  constructor(private ngZone: NgZone) {}

  show() {
    this.ngZone.run(() => {
      Promise.resolve().then(() => this._isLoading$.next(true));
    });
  }

  hide() {
    this.ngZone.run(() => {
      Promise.resolve().then(() => this._isLoading$.next(false));
    });
  }
}