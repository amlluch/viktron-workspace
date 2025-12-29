import { Injectable, Inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from 'shared';
import { API_CONFIG, type ApiConfig } from './api-config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly auth: AuthService,
    @Inject(API_CONFIG) private readonly api: ApiConfig
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(this.api.apiBaseUrl)) {
      return next.handle(req);
    }

    const accessToken = this.auth.getAccessToken();
    if (!accessToken) return next.handle(req);

    const authed = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });

    return next.handle(authed);
  }
}
