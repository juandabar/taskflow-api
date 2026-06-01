export const USER_ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
