export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const rolePermissions = {
  [ROLES.ADMIN]: [PERMISSIONS.CREATE, PERMISSIONS.READ, PERMISSIONS.UPDATE, PERMISSIONS.DELETE],
  [ROLES.EDITOR]: [PERMISSIONS.READ, PERMISSIONS.UPDATE],
  [ROLES.VIEWER]: [PERMISSIONS.READ],
};
