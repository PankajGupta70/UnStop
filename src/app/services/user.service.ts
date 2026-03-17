import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersSubject = new BehaviorSubject<User[]>([
    { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'Admin' },
    { name: 'Priya Nair', email: 'priya.nair@example.com', role: 'Editor' },
    { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', role: 'Viewer' },
    { name: 'Maya Singh', email: 'maya.singh@example.com', role: 'Editor' },
    { name: 'Neha Kapoor', email: 'neha.kapoor@example.com', role: 'Viewer' }
  ]);

  readonly users$ = this.usersSubject.asObservable();

  addUser(user: User): void {
    this.usersSubject.next([user, ...this.usersSubject.value]);
  }
}
