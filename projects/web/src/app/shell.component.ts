import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'shared';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterOutlet],
  template: `
    <header *ngIf="auth.isLoggedIn()" style="display:flex; gap:12px; align-items:center; padding:12px 16px; border-bottom:1px solid #eee;">
      <div style="flex:1;">
        <strong>Viktron</strong>
      </div>

      <button (click)="logout()" type="button">
        Logout
      </button>
    </header>

    <main style="padding:16px;">
      <router-outlet />
    </main>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
