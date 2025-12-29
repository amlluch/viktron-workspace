import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GreetingService {
  getGreeting(name: string): string {
    return `Hello, ${name}!`;
  }
}
