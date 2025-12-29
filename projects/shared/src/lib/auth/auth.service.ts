import { Inject, Injectable } from '@angular/core';
import { AUTH_CONFIG, AuthConfig } from './auth.config';

type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
};

const STORAGE_KEYS = {
  verifier: 'vk_pkce_verifier',
  state: 'vk_auth_state',
  access: 'vk_access_token',
  id: 'vk_id_token',
  refresh: 'vk_refresh_token',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(@Inject(AUTH_CONFIG) private readonly cfg: AuthConfig) {}

  /**
   * Starts Cognito Hosted UI login using OAuth2 Authorization Code + PKCE.
   * Redirects the browser to the /oauth2/authorize endpoint.
   */
  async startLogin(): Promise<void> {
    // Avoid “stuck” states because of old/expired tokens
    this.clearSessionTokensOnly();

    const state = this.randomString(24);
    const verifier = this.randomString(64);

    sessionStorage.setItem(STORAGE_KEYS.state, state);
    sessionStorage.setItem(STORAGE_KEYS.verifier, verifier);

    const challenge = await this.pkceChallenge(verifier);
    const base = this.cognitoBaseUrl();

    const url =
      `${base}/oauth2/authorize` +
      `?client_id=${encodeURIComponent(this.cfg.clientId)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(this.cfg.scopes)}` +
      `&redirect_uri=${encodeURIComponent(this.cfg.redirectUri)}` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(challenge)}`;

    window.location.assign(url);
  }

  /**
   * Exchanges "code" for tokens in /oauth2/token and stores them in sessionStorage.
   */
  async handleCallback(code: string | null, state: string | null): Promise<void> {
    const expectedState = sessionStorage.getItem(STORAGE_KEYS.state);
    const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier);

    if (!code || !state) {
      throw new Error('Missing code/state');
    }
    if (!expectedState || !verifier) {
      // Happens if you open /auth/callback manually or sessionStorage was cleared
      throw new Error('Missing stored state/verifier (sessionStorage)');
    }
    if (state !== expectedState) {
      this.clearSession();
      throw new Error('Invalid state');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.cfg.clientId,
      code,
      redirect_uri: this.cfg.redirectUri,
      code_verifier: verifier,
    });

    const tokenUrl = `${this.cognitoBaseUrl()}/oauth2/token`;

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const txt = await res.text();
      this.clearSession();
      throw new Error(`Token exchange failed (${res.status}): ${txt}`);
    }

    const tokens = (await res.json()) as TokenResponse;

    sessionStorage.setItem(STORAGE_KEYS.access, tokens.access_token);
    sessionStorage.setItem(STORAGE_KEYS.id, tokens.id_token);
    if (tokens.refresh_token) {
      sessionStorage.setItem(STORAGE_KEYS.refresh, tokens.refresh_token);
    }

    // Remove login-temp items
    sessionStorage.removeItem(STORAGE_KEYS.state);
    sessionStorage.removeItem(STORAGE_KEYS.verifier);
  }

  /**
   * Redirects to Cognito /logout and clears local session tokens.
   */
  logout(): void {
    this.clearSession();

    const base = this.cognitoBaseUrl();

    const url =
      `${base}/logout` +
      `?client_id=${encodeURIComponent(this.cfg.clientId)}` +
      `&logout_uri=${encodeURIComponent(this.cfg.logoutUri)}`;

    window.location.assign(url);
  }

  /**
   * Backwards-compatible name (your guards are calling this).
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Returns true if we have a non-expired access token.
   * If expired, tokens are cleared.
   */
  isAuthenticated(): boolean {
    const access = this.getAccessToken();
    if (!access) return false;

    const payload = this.decodeJwt(access);
    const exp = payload?.exp;
    const now = Math.floor(Date.now() / 1000);

    if (!exp || typeof exp !== 'number' || exp <= now) {
      this.clearSessionTokensOnly();
      return false;
    }
    return true;
  }

  /**
   * Checks if the access token contains "admins" in cognito:groups.
   * Handles formats like:
   * - ["admins"]
   * - "admins,other"
   * - "[admins]"   (yours is coming like this)
   */
  isAdmin(): boolean {
    const access = this.getAccessToken();
    if (!access) return false;

    const payload = this.decodeJwt(access);
    const raw = payload?.['cognito:groups'] ?? payload?.['groups'];
    if (!raw) return false;

    const groups = this.normalizeGroups(raw);
    return groups.includes('admins');
  }

  getIdToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.id);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.access);
  }

  // -------- internals --------

  private normalizeGroups(raw: any): string[] {
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x).trim()).filter(Boolean);
    }

    if (typeof raw === 'string') {
      const s = raw.trim();
      if (!s) return [];

      // "[admins]" or '["admins","x"]'
      if (s.startsWith('[') && s.endsWith(']')) {
        const inner = s.slice(1, -1).trim();
        if (!inner) return [];
        return inner
          .split(',')
          .map((x) => x.replace(/"/g, '').trim())
          .filter(Boolean);
      }

      // "admins,other"
      return s.split(',').map((x) => x.trim()).filter(Boolean);
    }

    return [];
  }

  private clearSessionTokensOnly(): void {
    sessionStorage.removeItem(STORAGE_KEYS.access);
    sessionStorage.removeItem(STORAGE_KEYS.id);
    sessionStorage.removeItem(STORAGE_KEYS.refresh);
  }

  private clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.state);
    sessionStorage.removeItem(STORAGE_KEYS.verifier);
    sessionStorage.removeItem(STORAGE_KEYS.access);
    sessionStorage.removeItem(STORAGE_KEYS.id);
    sessionStorage.removeItem(STORAGE_KEYS.refresh);
  }
  private cognitoBaseUrl(): string {
    const d = this.cfg.cognitoDomain.trim();

    // if already absolute, keep it
    if (d.startsWith('https://') || d.startsWith('http://')) {
      return d.replace(/\/+$/, ''); // remove trailing slashes
    }

    // otherwise force https://
    return `https://${d}`.replace(/\/+$/, '');
  }

  private randomString(len: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => chars[b % chars.length]).join('');
  }

  private async pkceChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(digest));
    const b64 = btoa(String.fromCharCode(...arr));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private decodeJwt(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
