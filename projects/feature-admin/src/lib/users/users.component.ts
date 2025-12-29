import { Component, Inject } from '@angular/core';
import { API_CONFIG, ApiConfig } from 'core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-create-user',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Create user</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Email</label><br />
      <input formControlName="email" placeholder="user@example.com" /><br /><br />

      <label>Temporary password (optional)</label><br />
      <input formControlName="tempPassword" placeholder="TempPassw0rd!123" /><br /><br />

      <button type="submit" [disabled]="form.invalid || loading">Create</button>
    </form>

    <p *ngIf="msg" style="margin-top:12px">{{ msg }}</p>
    <p *ngIf="err" style="margin-top:12px; color:red">{{ err }}</p>
  `,
})
export class UsersComponent {
  loading = false;
  msg: string | null = null;
  err: string | null = null;

  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly api: ApiConfig
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      tempPassword: [''],
    });
  }

  submit(): void {
    this.msg = null;
    this.err = null;
    this.loading = true;

    const payload = {
      email: this.form.value.email,
      tempPassword: this.form.value.tempPassword || undefined,
    };

    this.http.post(`${this.api.apiBaseUrl}/admin/users`, payload).subscribe({
      next: (res: any) => {
        this.msg = `Created: ${res?.email ?? payload.email} (status: ${res?.status ?? 'ok'})`;
        this.loading = false;
      },
      error: (e) => {
        const status = e.status;
        const code = e?.error?.error;

        if (status === 409 || code === 'user_already_exists') {
          alert('That user already exists.');
          return;
        }

        if (status === 400 || code === 'invalid_password' || code === 'invalid_parameter') {
          alert(`Invalid input: ${e?.error?.error ?? 'bad_request'}`);
          return;
        }

        alert('Unexpected error. Check logs.');
      },
    });
  }
}
