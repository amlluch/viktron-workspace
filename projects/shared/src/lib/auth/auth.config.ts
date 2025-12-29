import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  // Cognito Hosted UI base domain, e.g.
  // https://viktron-dev-xxxx.auth.eu-west-1.amazoncognito.com
  cognitoDomain: string;

  clientId: string;

  // Where Cognito sends you back after login (must match Cognito app client config)
  redirectUri: string;

  // Where Cognito sends you after logout (must match Cognito app client config)
  logoutUri: string;

  // e.g. "openid email profile"
  scopes: string;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
