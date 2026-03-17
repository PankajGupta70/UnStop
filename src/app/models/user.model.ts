export const USER_ROLES = ['Admin', 'Editor', 'Viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  name: string;
  email: string;
  role: UserRole;
}
