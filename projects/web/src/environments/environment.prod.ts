import type { Environment } from './environment.model';

export const environment: Environment = {
  production: true,

  apiBaseUrl: 'https://api.anonvpn.net',

  cognito: {
    domain: 'FILL_WITH_PROD.auth.eu-west-1.amazoncognito.com',
    userPoolId: 'FILL_WITH_POOL_ID_PROD',
    userPoolClientId: 'FILL_WITH_CLIENT_ID_PROD',
    scopes: 'openid email profile',
  },
};
