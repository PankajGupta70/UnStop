import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { USER_ROLES, User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
  protected readonly roles = USER_ROLES;
  readonly submitted = output<User>();
  readonly closed = output<void>();
  private readonly formBuilder = inject(FormBuilder);

  protected readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required]
  });

  protected close(): void {
    this.closed.emit();
  }

  protected save(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { name, email, role } = this.userForm.getRawValue();

    this.submitted.emit({
      name: name.trim(),
      email: email.trim(),
      role: role as User['role']
    });

    this.userForm.reset({ name: '', email: '', role: '' });
  }

  protected hasError(controlName: 'name' | 'email' | 'role'): boolean {
    const control = this.userForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
