import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreetingService } from 'core';

@Component({
  selector: 'feature-hello',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>{{ message }}</h1>
    <p>This page comes from <code>feature-hello</code>.</p>
  `,
})
export class HelloComponent {
  readonly message: string;

  constructor(private readonly greeting: GreetingService) {
    this.message = this.greeting.getGreeting('Alfonso');
  }
}
