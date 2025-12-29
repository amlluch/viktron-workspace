import { Component, OnInit } from '@angular/core';
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    try {
      await this.auth.handleCallback(code, state);

      const target = this.auth.isAdmin() ? '/admin/users' : '/hello';
      await this.router.navigateByUrl(target);
    } catch (e: any) {
      this.error = e?.message ?? String(e);
      // await this.router.navigateByUrl('/login');
    }
  }
}
