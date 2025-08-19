import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  // Mapa, která přiřazuje každé roli pole oprávnění.
  private rolePermissions = new Map<string, string[]>([
    ['sysadmin', ['manage-administrators', 'view-business-logs', 'view-personal-info', 'view-user-requests', 'view-dashboard']],
    ['admin', ['view-user-requests', 'view-dashboard', 'view-personal-info']]
  ]);

  constructor() { }

  /**
   * Zjistí, zda má daná role konkrétní oprávnění.
   * @param role Role uživatele.
   * @param permission Oprávnění, které se má zkontrolovat.
   * @returns `true`, pokud má uživatel oprávnění, jinak `false`.
   */
  hasPermission(role: string, permission: string): boolean {
    const permissions = this.rolePermissions.get(role);
    if (!permissions) {
      return false;
    }
    return permissions.includes(permission);
  }
}