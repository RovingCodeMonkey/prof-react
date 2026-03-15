export const PageMode = {
  Add: 'add',
  Edit: 'edit',
} as const

export type PageMode = typeof PageMode[keyof typeof PageMode]