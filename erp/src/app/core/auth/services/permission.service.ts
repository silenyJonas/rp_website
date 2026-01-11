import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userPermissions$ = new BehaviorSubject<string[]>([]);

  constructor() {
    // Načtení při F5
    const savedPermissions = localStorage.getItem('userPermissions');
    if (savedPermissions) {
      try {
        this.userPermissions$.next(JSON.parse(savedPermissions));
      } catch (e) {
        console.error('Chyba při parsování userPermissions', e);
      }
    }
  }

  setPermissions(permissions: string[]): void {
    this.userPermissions$.next(permissions || []);
  }

  hasPermission(permission: string): boolean {
    const currentPermissions = this.userPermissions$.getValue();
    return currentPermissions.includes(permission);
  }

  clearPermissions(): void {
    this.userPermissions$.next([]);
  }
}