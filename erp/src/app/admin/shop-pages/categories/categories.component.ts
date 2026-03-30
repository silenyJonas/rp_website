import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { CategoryNode } from '../components/interfaces/category-node';
import { Button } from '../../../shared/interfaces/button';
import { CATEGORY_TOOLBAR_BUTTONS, CATEGORY_ROW_BUTTONS } from './categories.config';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, SHARED_UI_BUILDERS],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  apiEndpoint = 'shop/categories';
  categories: CategoryNode[] = [];
  private backupNames: Map<number, string> = new Map();

  constructor(
    private dataHandler: Core.DataHandler,
    private cd: Core.ChangeDetectorRef,
    private alertDialogService: Core.AlertDialogService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadTree();
  }

  get toolbarButtons(): Button[] {
    return CATEGORY_TOOLBAR_BUTTONS;
  }

  getRowButtons(node: CategoryNode): Button[] {
    return CATEGORY_ROW_BUTTONS.map(btn => {
      const updatedBtn = { ...btn };
      if (btn.action === 'toggleStatus') {
        updatedBtn.icon = node.is_active ? '🟢' : '⚪';
        updatedBtn.class = node.is_active ? 'btn-export' : 'btn-filter';
      }
      return updatedBtn;
    });
  }

  getEditButtons(node: CategoryNode): Button[] {
    const isDuplicate = this.isDuplicateName(node);
    const isEmpty = !node.name || node.name.trim().length === 0;

    return [
      { action: 'submit', label: 'Uložit', icon: '✅', class: 'btn-create', disabled: isDuplicate || isEmpty },
      { action: 'cancel', label: '', icon: '❌', class: 'btn-trash' }
    ];
  }

  isDuplicateName(node: CategoryNode): boolean {
    const check = (list: CategoryNode[]): boolean => {
      for (const cat of list) {
        if (cat.id !== node.id && cat.parent_id === node.parent_id && cat.name.toLowerCase() === node.name.toLowerCase()) return true;
        if (cat.children?.length && check(cat.children)) return true;
      }
      return false;
    };
    return check(this.categories);
  }

  handleToolbarAction(action: string): void {
    if (action === 'expandAll') this.expandAll(true);
    if (action === 'collapseAll') this.expandAll(false);
    if (action === 'addMain') this.initAddCategory(null);
  }

  handleRowAction(action: string, node: CategoryNode): void {
    switch (action) {
      case 'addChild': this.initAddCategory(node.id); break;
      case 'edit': this.startEdit(node); break;
      case 'toggleStatus': this.toggleStatus(node); break;
      case 'delete': this.deleteCategory(node); break;
    }
  }

  handleEditAction(action: string, node: CategoryNode): void {
    if (action === 'submit') {
      if (!node.name || node.name.trim().length === 0 || this.isDuplicateName(node)) return; 
      if (node.id === 0) this.confirmAdd(node); else this.saveNode(node);
    } else {
      if (node.id === 0) this.loadTree(node.parent_id); else this.cancelEdit(node);
    }
  }

  initAddCategory(parentId: number | null): void {
    const newNode: any = { id: 0, name: '', parent_id: parentId, isEditing: true, is_active: true, children: [] };
    if (!parentId) {
      this.categories = [newNode, ...this.categories];
    } else {
      const findAndAdd = (list: CategoryNode[]) => {
        for (const n of list) {
          if (n.id === parentId) { n.isExpanded = true; n.children = [newNode, ...(n.children || [])]; return; }
          if (n.children) findAndAdd(n.children);
        }
      };
      findAndAdd(this.categories);
    }
    this.cd.detectChanges();
    setTimeout(() => this.editInputs.first?.nativeElement.focus(), 50);
  }

  confirmAdd(node: CategoryNode): void {
    this.dataHandler.post(this.apiEndpoint, { name: node.name, parent_id: node.parent_id, is_active: true })
      .subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', 'Kategorie byla vytvořena.', 'success');
          this.loadTree(node.parent_id);
        },
        error: (err) => this.alertDialogService.open('Chyba', err.error?.message || 'Vytvoření selhalo.', 'danger')
      });
  }

  startEdit(node: CategoryNode): void {
    this.backupNames.set(node.id, node.name);
    node.isEditing = true;
    this.cd.detectChanges();
    setTimeout(() => this.editInputs.last?.nativeElement.focus(), 50);
  }

  cancelEdit(node: CategoryNode): void {
    const originalName = this.backupNames.get(node.id);
    if (originalName !== undefined) node.name = originalName;
    node.isEditing = false;
    this.backupNames.delete(node.id);
    this.cd.markForCheck();
  }

  loadTree(forceExpandId?: number | null): void {
    this.dataHandler.get<CategoryNode[]>(`${this.apiEndpoint}?no_pagination=true`).subscribe({
      next: (res) => {
        this.categories = this.buildTree(res, null, forceExpandId);
        this.cd.markForCheck();
      }
    });
  }

  buildTree(list: CategoryNode[], parentId: number | null = null, forceExpandId?: number | null): CategoryNode[] {
    return list
      .filter(item => item.parent_id === parentId)
      .map(item => {
        const children = this.buildTree(list, item.id, forceExpandId);
        return {
          ...item,
          children,
          directChildrenCount: children.length,
          totalRecursiveCount: children.reduce((acc, child) => acc + 1 + (child.totalRecursiveCount || 0), 0),
          isExpanded: item.isExpanded || item.id === forceExpandId
        };
      });
  }

  expandAll(state: boolean): void {
    const toggle = (nodes: CategoryNode[]) => {
      nodes.forEach(n => { n.isExpanded = state; if (n.children) toggle(n.children); });
    };
    toggle(this.categories);
    this.cd.markForCheck();
  }

  saveNode(node: CategoryNode): void {
    this.dataHandler.put(`${this.apiEndpoint}/${node.id}`, { name: node.name, parent_id: node.parent_id })
      .subscribe({
        next: () => {
          this.alertDialogService.open('Aktualizováno', 'Změny byly uloženy.', 'success');
          node.isEditing = false; 
          this.backupNames.delete(node.id);
          this.cd.markForCheck(); 
        },
        error: (err) => this.alertDialogService.open('Chyba', err.error?.message || 'Uložení selhalo.', 'danger')
      });
  }

  toggleStatus(node: CategoryNode): void {
    const newStatus = !node.is_active;
    this.dataHandler.put(`${this.apiEndpoint}/${node.id}`, { ...node, is_active: newStatus })
      .subscribe({
        next: () => {
          node.is_active = newStatus;
          this.cd.markForCheck();
        },
        error: () => this.alertDialogService.open('Chyba', 'Změna stavu selhala.', 'danger')
      });
  }

  async deleteCategory(node: CategoryNode): Promise<void> {
    if (node.children?.length) {
      await this.alertDialogService.open('Nelze smazat', 'Smažte nejdříve podkategorie.', 'warning');
      return;
    }

    const confirmed = await this.confirmDialogService.open(
      'Potvrdit smazání', 
      `Opravdu si přejete smazat kategorii "${node.name}"?`
    );

    if (confirmed) {
      this.dataHandler.delete(`${this.apiEndpoint}/${node.id}`).subscribe({
        next: () => {
          this.alertDialogService.open('Smazáno', 'Kategorie byla odstraněna.', 'success');
          this.loadTree(node.parent_id);
        },
        error: (err) => {
          this.alertDialogService.open('Chyba', err.error?.message || 'Smazání selhalo.', 'danger');
        }
      });
    }
  }
}