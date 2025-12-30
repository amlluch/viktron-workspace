export interface CognitoEnvConfig {
  domain: string;            // e.g. viktron-dev-...amazoncognito.com
  userPoolId: string;
  userPoolClientId: string;
  scopes: string;            // 'openid email profile'
}

export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  cognito: CognitoEnvConfig;
}
