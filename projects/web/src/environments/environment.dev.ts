import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,

  apiBaseUrl: 'https://api-dev.anonvpn.net',

  cognito: {
    domain: 'viktron-dev-271067881658.auth.eu-west-1.amazoncognito.com',
    userPoolId: 'eu-west-1_JZ9B0hbze',
    userPoolClientId: '6u08ffec5jfgq2caqcbs13lg8c',
    scopes: 'openid email profile',
  },
};
