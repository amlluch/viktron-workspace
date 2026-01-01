import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  imports: [CommonModule],
  template: `
    <p>Signing you in...</p>
    <p *ngIf="error" style="color:red">{{ error }}</p>
  `,
})
export class AuthCallbackComponent implements OnInit {
  error: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  async ngOnInit(): Promise<void> {
    try {
      const oauthError = this.route.snapshot.queryParamMap.get('error');
      const oauthErrorDesc = this.route.snapshot.queryParamMap.get('error_description');

      if (oauthError) {
        this.error = `${oauthError}${oauthErrorDesc ? `: ${oauthErrorDesc}` : ''}`;
        return;
      }

      const code = this.route.snapshot.queryParamMap.get('code');
      const state = this.route.snapshot.queryParamMap.get('state');
      if (!code || !state) {
        this.error = 'Missing code/state';
        return;
      }

      // Exchange the authorization code for tokens (PKCE)
      await this.auth.handleCallback(code, state);

      // Decide landing page
      const target = this.auth.isAdmin() ? '/admin/users' : '/hello';

      // Optional: clean URL so you don't keep code/state in history
      await this.router.navigateByUrl(target, { replaceUrl: true });
    } catch (e: any) {
      this.error = e?.message ? String(e.message) : String(e);
      // If something went wrong, push user back to login after showing error
      // (leave it manual for now; if you prefer auto redirect, tell me)
      console.error('[auth-callback] failed', e);
    }
  }
}
