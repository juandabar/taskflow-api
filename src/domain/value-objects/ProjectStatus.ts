export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUS) as [
  ProjectStatus,
  ...ProjectStatus[],
];
