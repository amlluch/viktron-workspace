import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreetingService } from 'core';
import { AuthService } from 'shared';

@Component({
  selector: 'feature-hello',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hello.html',
})
export class Hello {
  readonly message: string;

  constructor(
    private readonly greeting: GreetingService,
    private readonly auth: AuthService
  ) {
    this.message = this.greeting.getGreeting('Alfonso');
  }

  logout(): void {
    this.auth.logout();
  }
}
