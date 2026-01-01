import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login-redirect',
  template: `Redirecting to login...`,
})
export class LoginRedirectComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    console.log('[login] init');

    if (this.auth.isAuthenticated()) {
      const target = this.auth.isAdmin() ? '/admin/users' : '/hello';
      console.log('[login] already authenticated ->', target);
      await this.router.navigateByUrl(target);
      return;
    }

    console.log('[login] not authenticated -> redirect to Cognito');
    await this.auth.startLogin(); // hard redirect
  }
}
