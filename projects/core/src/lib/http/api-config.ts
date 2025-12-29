import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  apiBaseUrl: string; // https://api-dev.anonvpn.net
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
