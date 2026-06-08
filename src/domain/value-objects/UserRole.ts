export const USER_ROLE = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_VALUES = Object.values(USER_ROLE) as [UserRole, ...UserRole[]];
