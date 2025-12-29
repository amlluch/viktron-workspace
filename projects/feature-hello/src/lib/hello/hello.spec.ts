import { TestBed } from '@angular/core/testing';
import { Hello } from './hello';
import { GreetingService } from 'core';
import { AuthService } from 'shared';

describe('Hello', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hello],
      providers: [
        GreetingService,
        {
          provide: AuthService,
          useValue: {
            logout: async () => {}, // stub
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Hello);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
