export const environment = {
  production: false,

  apiBaseUrl: 'https://api-dev.anonvpn.net',

  cognito: {
    domain: 'viktron-dev-271067881658.auth.eu-west-1.amazoncognito.com',
    clientId: '6u08ffec5jfgq2caqcbs13lg8c',
    redirectUri: 'http://localhost:4200/auth/callback',
    logoutUri: 'http://localhost:4200/',
    scopes: 'openid email profile',
  },
};
