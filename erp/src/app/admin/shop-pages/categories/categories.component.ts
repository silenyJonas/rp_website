import { Component, OnInit, ViewChildren, QueryList, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { CategoryNode } from '../components/interfaces/category-node';
import { Button } from '../../../shared/interfaces/button';
import { CATEGORY_TOOLBAR_BUTTONS, CATEGORY_ROW_BUTTONS } from './categories.config';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { BaseDataComponent } from '../../components/base-data/base-data.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, SHARED_UI_BUILDERS],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent extends BaseDataComponent<CategoryNode> implements OnInit {
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  override apiEndpoint = 'shop/categories';
  categories: CategoryNode[] = [];
  
  private backupNames: Map<number, string> = new Map();
  private expandedStates: Set<number> = new Set();

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private confirmDialogService: ConfirmDialogService,
    private router: Core.Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadExpandedStates();
    this.initWithAuthCheck(this.router);
  }

  /**
   * Refresh dat volaný automaticky z BaseDataComponent po ověření přihlášení
   */
  override refreshData(): void {
    this.loadTree();
  }

  get toolbarButtons(): Button[] {
    return CATEGORY_TOOLBAR_BUTTONS;
  }

  getRowButtons(node: CategoryNode): Button[] {
    return CATEGORY_ROW_BUTTONS.map(btn => {
      const updatedBtn = { ...btn };
      if (btn.action === 'toggleStatus') {
        updatedBtn.icon = node.is_active ? 'Aktivní 🟢' : ' Neaktivní ⚪';
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
      { action: 'cancel', label: 'Zrušit', icon: '❌', class: 'btn-trash' }
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
      if (node.id === 0) this.loadTree(); else this.cancelEdit(node);
    }
  }

  initAddCategory(parentId: number | null): void {
    const newNode: any = { id: 0, name: '', parent_id: parentId, isEditing: true, is_active: false, children: [] };
    if (!parentId) {
      this.categories = [newNode, ...this.categories];
    } else {
      const findAndAdd = (list: CategoryNode[]) => {
        for (const n of list) {
          if (n.id === parentId) {
            n.isExpanded = true;
            this.expandedStates.add(n.id);
            n.children = [newNode, ...(n.children || [])];
            return;
          }
          if (n.children) findAndAdd(n.children);
        }
      };
      findAndAdd(this.categories);
    }
    this.cd.detectChanges();
  }

  confirmAdd(node: CategoryNode): void {
    // Optimistická aktualizace - odstranit nový uzel z UI během odesílání
    const parentId = node.parent_id;
    if (!parentId) {
      this.categories = this.categories.filter(c => c.id !== 0);
    } else {
      this.removeNewNodeFromParent(this.categories, parentId);
    }
    this.cd.markForCheck();

    this.postData({ name: node.name, parent_id: node.parent_id, is_active: false } as CategoryNode)
      .subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', 'Kategorie byla vytvořena.', 'success');
          this.loadTree();
        },
        error: (err) => {
          this.alertDialogService.open('Chyba', err.error?.message || 'Vytvoření selhalo.', 'danger');
          this.loadTree();
        }
      });
  }

  private removeNewNodeFromParent(nodes: CategoryNode[], parentId: number): void {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.children = node.children?.filter(c => c.id !== 0) || [];
        return;
      }
      if (node.children?.length) {
        this.removeNewNodeFromParent(node.children, parentId);
      }
    }
  }

  startEdit(node: CategoryNode): void {
    this.backupNames.set(node.id, node.name);
    node.isEditing = true;
    this.cd.detectChanges();
    setTimeout(() => this.editInputs.last?.nativeElement.focus(), 0);
  }

  cancelEdit(node: CategoryNode): void {
    const originalName = this.backupNames.get(node.id);
    if (originalName !== undefined) node.name = originalName;
    node.isEditing = false;
    this.backupNames.delete(node.id);
    this.cd.markForCheck();
  }

  loadTree(forceExpandId?: number | null): void {
    this.loadingService.show();
    this.loadAllData().subscribe({
      next: (res) => {
        this.categories = this.buildTree(res, null, forceExpandId);
        this.cd.markForCheck();
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
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
          isExpanded: this.expandedStates.has(item.id) || item.id === forceExpandId
        };
      });
  }

  expandAll(state: boolean): void {
    const toggle = (nodes: CategoryNode[]) => {
      nodes.forEach(n => {
        n.isExpanded = state;
        if (state) {
          this.expandedStates.add(n.id);
        } else {
          this.expandedStates.delete(n.id);
        }
        if (n.children) toggle(n.children);
      });
    };
    toggle(this.categories);
    this.saveExpandedStates();
    this.cd.markForCheck();
  }

  saveNode(node: CategoryNode): void {
    // Optimistická aktualizace - okamžitě skrýt edit mode
    node.isEditing = false;
    this.cd.markForCheck();

    this.updateData(node.id, { name: node.name, parent_id: node.parent_id } as CategoryNode)
      .subscribe({
        next: () => {
          this.alertDialogService.open('Aktualizováno', 'Změny byly uloženy.', 'success');
          this.backupNames.delete(node.id);
          this.cd.markForCheck(); 
        },
        error: (err) => {
          // Vrátit do edit módu v případě chyby
          node.isEditing = true;
          this.cd.markForCheck();
          this.alertDialogService.open('Chyba', err.error?.message || 'Uložení selhalo.', 'danger')
        }
      });
  }

  toggleStatus(node: CategoryNode): void {
    const newStatus = !node.is_active;
    // Optimistická aktualizace - okamžitě změnit UI
    node.is_active = newStatus;
    this.cd.markForCheck();

    this.updateData(node.id, { ...node, is_active: newStatus })
      .subscribe({
        next: () => {
          // UI je už aktuální, stačí jen potvrzení
        },
        error: () => {
          // Vrátit do původního stavu v případě chyby
          node.is_active = !newStatus;
          this.cd.markForCheck();
          this.alertDialogService.open('Chyba', 'Změna stavu selhala.', 'danger')
        }
      });
  }

  // async deleteCategory(node: CategoryNode): Promise<void> {
  //   if (node.children?.length) {
  //     await this.alertDialogService.open('Nelze smazat', 'Smažte nejdříve podkategorie.', 'warning');
  //     return;
  //   }

  //   const confirmed = await this.confirmDialogService.open(
  //     'Potvrdit smazání', 
  //     `Opravdu si přejete smazat kategorii "${node.name}"?`
  //   );

  //   if (confirmed) {
  //     // Optimistická aktualizace - okamžitě odstranit z UI
  //     this.removeNodeFromTree(node.id);
  //     this.expandedStates.delete(node.id);
  //     this.cd.markForCheck();

  //     this.deleteData(node.id).subscribe({
  //       next: () => {
  //         this.alertDialogService.open('Smazáno', 'Kategorie byla odstraněna.', 'success');
  //         this.saveExpandedStates();
  //       },
  //       error: (err) => {
  //         // Vrátit kompletní strom v případě chyby
  //         this.alertDialogService.open('Chyba', err.error?.message || 'Smazání selhalo.', 'danger');
  //         this.loadTree();
  //       }
  //     });
  //   }
  // }
  async deleteCategory(node: CategoryNode): Promise<void> {
  // 1. Kontrola na podkategorie (tu už tam máš)
  if (node.children?.length) {
    await this.alertDialogService.open(
      'Nelze smazat', 
      'Smažte nejdříve podkategorie.', 
      'warning'
    );
    return;
  }

  // 2. NOVÉ: Kontrola na produkty (pokud tvé API vrací products_count)
  // Poznámka: Pokud tvůj interface CategoryNode toto pole nemá, přidej si ho do něj
  if (node.products_count && node.products_count > 0) {
    await this.alertDialogService.open(
      'Nelze smazat', 
      `Kategorii "${node.name}" nelze smazat, protože obsahuje přiřazené produkty (${node.products_count}). Nejdříve produkty přesuňte nebo smažte.`, 
      'warning'
    );
    return;
  }

  const confirmed = await this.confirmDialogService.open(
    'Potvrdit smazání', 
    `Opravdu si přejete smazat kategorii "${node.name}"?`
  );

  if (confirmed) {
    // Optimistická aktualizace - okamžitě odstranit z UI
    this.removeNodeFromTree(node.id);
    this.expandedStates.delete(node.id);
    this.cd.markForCheck();

    this.deleteData(node.id).subscribe({
      next: () => {
        this.alertDialogService.open('Smazáno', 'Kategorie byla odstraněna.', 'success');
        this.saveExpandedStates();
      },
      error: (err) => {
        // Pokud backend vrátí chybu (např. tu 422 o produktech, kterou jsme v PHP přidali),
        // tak se loadTree() postará o navrácení kategorie zpět do UI a zobrazí se zpráva z backendu.
        this.alertDialogService.open(
          'Chyba', 
          err.error?.message || 'Smazání selhalo.', 
          'danger'
        );
        this.loadTree();
      }
    });
  }
}
  private removeNodeFromTree(nodeId: number): void {
    const removeRecursive = (nodes: CategoryNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children?.length && removeRecursive(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };
    removeRecursive(this.categories);
  }

  toggleExpanded(node: CategoryNode, event?: Event): void {
    if (event) event.stopPropagation();
    if (!node.children?.length) return;
    
    node.isExpanded = !node.isExpanded;
    
    if (node.isExpanded) {
      this.expandedStates.add(node.id);
    } else {
      this.expandedStates.delete(node.id);
    }
    
    this.saveExpandedStates();
    this.cd.markForCheck();
  }

  private saveExpandedStates(): void {
    localStorage.setItem('categoryExpandedStates', JSON.stringify(Array.from(this.expandedStates)));
  }

  private loadExpandedStates(): void {
    const saved = localStorage.getItem('categoryExpandedStates');
    if (saved) {
      this.expandedStates = new Set(JSON.parse(saved));
    }
  }
}