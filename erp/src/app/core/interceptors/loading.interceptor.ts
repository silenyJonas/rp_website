import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, delay } from 'rxjs/operators'; // Přidán delay
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  this.activeRequests++;

  // Zobraz loading až po 500ms
  const timer = setTimeout(() => {
    if (this.activeRequests > 0) {
      this.loadingService.show();
    }
  }, 500);

  return next.handle(request).pipe(
    finalize(() => {
      clearTimeout(timer); // Zruš timer pokud request skončil dříve
      this.activeRequests--;
      if (this.activeRequests === 0) {
        this.loadingService.hide();
      }
    })
  );
}
}