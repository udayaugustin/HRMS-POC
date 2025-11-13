import { SetMetadata } from '@nestjs/common';

export interface PermissionRequirement {
  module: string;
  action: string;
}

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Permission requirements (module and action)
 * @example
 * @RequirePermissions({ module: 'EMPLOYEES', action: 'CREATE' })
 */
export const RequirePermissions = (permissions: PermissionRequirement) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
