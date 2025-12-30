import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AUTH_CONFIG } from 'shared';
import { API_CONFIG, AuthInterceptor } from 'core';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    {
      provide: AUTH_CONFIG,
      useValue: {
        cognitoDomain: environment.cognito.domain,
        clientId: environment.cognito.userPoolClientId,
        redirectUri: `${window.location.origin}/auth/callback`,
        logoutUri: `${window.location.origin}/`,
        scopes: environment.cognito.scopes ?? 'openid email profile',
      },
    },

    { provide: API_CONFIG, useValue: { apiBaseUrl: environment.apiBaseUrl } },
  ],
};
