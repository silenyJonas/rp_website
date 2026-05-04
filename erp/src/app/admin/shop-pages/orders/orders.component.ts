import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { 
  ORDER_BUTTONS, 
  ORDER_COLUMNS, 
  TRASH_ORDER_COLUMNS, 
  FILTER_COLUMNS, 
  TOOLBAR_BUTTONS,
  STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS
} from './orders.config';
import { Order, OrderItem, Customer, Product, ProductVariant, PaymentMethod, ShippingMethod, Coupon } from './order-specific.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, SHARED_UI_BUILDERS],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent extends BaseDataComponent<Order> implements OnInit, OnDestroy {
  override apiEndpoint: string = 'shop/orders';
  @ViewChild('activeTable') activeTable!: any;

  // Data
  customers: Customer[] = [];
  products: Product[] = [];
  variants: ProductVariant[] = [];
  paymentMethods: PaymentMethod[] = [];
  shippingMethods: ShippingMethod[] = [];
  coupons: Coupon[] = [];
  statusOptions = STATUS_OPTIONS;
  paymentStatusOptions = PAYMENT_STATUS_OPTIONS;

  // Summary calculations
  summaryTaxAmount = 0;

  // UI State
  showOrderForm = false;
  showDetailsModal = false;
  override showTrashTable = false;
  showFiltersPanel = false;

  // Data Being Edited
  selectedOrderForDetail: Order | null = null;
  editingOrder: Order | null = null;
  editingItemIdx: number | null = null;

  // Double-click prevention
  private isProcessing = false;

  filters: Core.FilterParams = {
    sort_by: 'created_at',
    sort_direction: 'desc'
  };

  buttons = ORDER_BUTTONS;
  orderColumns = ORDER_COLUMNS;
  trashOrderColumns = TRASH_ORDER_COLUMNS;
  filterColumns = FILTER_COLUMNS;
  toolbarButtons = TOOLBAR_BUTTONS;

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private router: Core.Router,
    private confirmDialog: ConfirmDialogService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initWithAuthCheck(this.router);
    this.loadDependencies();
    this.refreshData();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(lock: boolean): void {
    if (lock) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  // ========== LOAD DEPENDENCIES ==========

  private loadDependencies(): void {
    this.loadCustomers();
    this.loadProducts();
    this.loadVariants();
    this.loadPaymentMethods();
    this.loadShippingMethods();
    this.loadCoupons();
    this.updateFilterOptions();
  }

  private loadCustomers(): void {
    this.dataHandler.getCollection<Customer>('shop/customers?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.customers = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání zákazníků:', err)
      });
  }

  private loadProducts(): void {
    this.dataHandler.getCollection<Product>('shop/products?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.products = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání produktů:', err)
      });
  }

  private loadVariants(): void {
    this.dataHandler.getCollection<any>('shop/products?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.variants = [];
          products.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
              product.variants.forEach((variant: any) => {
                this.variants.push({
                  ...variant,
                  product_id: product.id,
                  product_name: product.name
                });
              });
            }
          });
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání variant:', err)
      });
  }

  private loadPaymentMethods(): void {
    this.dataHandler.getCollection<any>('shop/payment_methods?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paymentMethods = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání způsobů platby:', err)
      });
  }

  private loadShippingMethods(): void {
    this.dataHandler.getCollection<ShippingMethod>('shop/shipping_methods?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.shippingMethods = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání způsobů dopravy:', err)
      });
  }

  private loadCoupons(): void {
    this.dataHandler.getCollection<Coupon>('shop/coupons?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.coupons = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání kuponů:', err)
      });
  }

  private updateFilterOptions(): void {
    const statusFilter = this.filterColumns.find(f => f.key === 'status');
    if (statusFilter) {
      statusFilter.options = this.statusOptions;
    }

    const paymentFilter = this.filterColumns.find(f => f.key === 'payment_status');
    if (paymentFilter) {
      paymentFilter.options = this.paymentStatusOptions;
    }

    this.cd.markForCheck();
  }

  // ========== TOOLBAR ACTIONS ==========

  handleToolbarAction(action: string): void {
    if (this.isProcessing) return;

    const actions: { [key: string]: () => void } = {
      toggleFilters: () => this.toggleFilters(),
      handleCreateFormOpened: () => this.handleCreateFormOpened(),
      toggleTable: () => this.toggleTable(),
      exportActiveTable: () => this.exportActiveTable()
    };

    if (actions[action]) actions[action]();
  }

  exportActiveTable(): void {
    if (this.activeTable) {
      this.activeTable.exportToCSV();
    } else {
      console.error('Nebyla nalezena aktivní tabulka pro export.');
    }
  }

  override toggleFilters(): void {
    this.showFiltersPanel = !this.showFiltersPanel;
    this.cd.markForCheck();
  }

  override toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    if (this.showTrashTable) {
      const trashFilters = { ...this.filters, only_trashed: 'true' };
      this.forceFullRefresh(trashFilters);
    } else {
      this.refreshData();
    }
  }

  // ========== FILTROVÁNÍ ==========

  override refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(newFilters: Core.FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'created_at', sort_direction: 'desc' };
    this.refreshData();
  }

  handlePageChange(page: number): void {
    this.onHandlePageChange(page, this.filters);
  }

  handleItemsPerPageChange(value: number): void {
    this.onHandleItemsPerPageChange(value, this.filters);
  }

  // ========== DETAIL OBJEDNÁVKY ==========

  handleViewDetails(item: Order): void {
    if (this.isProcessing || !item.id) return;

    this.isProcessing = true;
    this.loadingService.show();

    this.getItemDetails(item.id).pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullOrder) => {
        this.selectedOrderForDetail = fullOrder;
        this.showDetailsModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: () => {
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst detaily objednávky.', 'danger');
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrderForDetail = null;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }

  // ========== VYTVOŘENÍ/EDITACE OBJEDNÁVKY ==========

  handleCreateFormOpened(): void {
    if (this.isProcessing) return;

    this.editingOrder = {
      order_number: '',
      customer_id: 0,
      status: 'pending',
      payment_status: 'pending',
      total_amount: 0,
      shipping_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      payment_method_id: 0,
      shipping_method_id: 0,
      shipping_address: '',
      shipping_city: '',
      shipping_postal_code: '',
      shipping_country: 'Česko',
      items: []
    };

    this.showOrderForm = true;
    this.toggleBodyScroll(true);
    this.cd.markForCheck();
  }

  handleEditFormOpened(order: Order, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isProcessing) return;
    this.openEditOrderForm(order);
  }

  openEditOrderForm(order: Order): void {
    if (this.isProcessing || !order.id) return;

    this.isProcessing = true;
    this.loadingService.show();

    this.getItemDetails(order.id).pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullOrder) => {
        this.editingOrder = { ...fullOrder };
        this.showOrderForm = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: () => {
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst objednávku.', 'danger');
      }
    });
  }

  // ========== POLOŽKY OBJEDNÁVKY ==========

  addOrderItem(): void {
    if (!this.editingOrder) return;
    if (!this.editingOrder.items) {
      this.editingOrder.items = [];
    }

    this.editingOrder.items.push({
      product_id: 0,
      product_name: '',
      product_variant_id: 0,
      variant_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });

    this.cd.markForCheck();
  }

  async deleteOrderItem(index: number): Promise<void> {
    const confirmed = await this.confirmDialog.open(
      'Smazat položku',
      'Opravdu chcete smazat tuto položku z objednávky?'
    );

    if (confirmed && this.editingOrder?.items) {
      const item = this.editingOrder.items[index];
      if (item.id) {
        item._delete = true;
      } else {
        this.editingOrder.items.splice(index, 1);
      }
      this.recalculateTotals();
      this.cd.markForCheck();
    }
  }

  onVariantSelected(item: OrderItem, index: number): void {
    if (!item.product_variant_id) return;

    const variant = this.variants.find(v => Number(v.id) === Number(item.product_variant_id));

    if (variant) {
      item.product_id = variant.product_id;
      item.product_name = variant.product_name || '';
      item.variant_name = variant.variant_name;
      item.unit_price = variant.price_with_vat; 
      item.total_price = item.quantity * item.unit_price;
    }

    this.recalculateTotals();
    this.cd.markForCheck();
  }

  onItemQuantityChange(item: OrderItem): void {
    item.total_price = item.quantity * item.unit_price;
    this.recalculateTotals();
    this.cd.markForCheck();
  }

  onItemPriceChange(item: OrderItem): void {
    item.total_price = item.quantity * item.unit_price;
    this.recalculateTotals();
    this.cd.markForCheck();
  }

  getTrashToolbarButtons(): any[] {
    return this.toolbarButtons.filter(btn => 
      btn.action !== 'handleCreateFormOpened' && 
      btn.action !== 'exportActiveTable'
    );
  }

  // ========== VÝPOČTY ==========

  recalculateTotals(): void {
    if (!this.editingOrder) return;

    const items = (this.editingOrder.items || []).filter(i => !i._delete);
    
    let productsTotal = 0;
    items.forEach(item => {
      productsTotal += (Number(item.quantity || 0) * Number(item.unit_price || 0));
    });
    this.editingOrder.total_amount = productsTotal;

    let discount = 0;
    if (this.editingOrder.coupon_id) {
      const idToFind = Number(this.editingOrder.coupon_id);
      const coupon = this.coupons.find(c => Number(c.id) === idToFind);
      if (coupon) {
        discount = (coupon.discount_type === 'percent') 
          ? (productsTotal * Number(coupon.discount_value)) / 100 
          : Number(coupon.discount_value);
      }
    }
    this.editingOrder.discount_amount = Math.min(discount, productsTotal);

    this.editingOrder.shipping_amount = this.getShippingMethodPrice(this.editingOrder.shipping_method_id);
    const paymentFee = this.getPaymentMethodPrice(this.editingOrder.payment_method_id);

    this.editingOrder.final_amount = (productsTotal - this.editingOrder.discount_amount) + 
                                     this.editingOrder.shipping_amount + 
                                     paymentFee;

    this.cd.markForCheck();
  }

  // ========== SAVE OBJEDNÁVKA ==========

  saveOrder(): void {
    if (this.isProcessing || !this.editingOrder || !this.validateOrder()) return;

    this.isProcessing = true;
    const payload = {
      customer_id: this.editingOrder.customer_id,
      payment_method_id: this.editingOrder.payment_method_id,
      shipping_method_id: this.editingOrder.shipping_method_id,
      coupon_id: this.editingOrder.coupon_id || null,
      status: this.editingOrder.status,
      payment_status: this.editingOrder.payment_status,
      shipping_address: this.editingOrder.shipping_address,
      shipping_city: this.editingOrder.shipping_city,
      shipping_postal_code: this.editingOrder.shipping_postal_code,
      shipping_country: this.editingOrder.shipping_country,
      notes: this.editingOrder.notes,
      items: (this.editingOrder.items || []).filter(i => !i._delete),
      delete_items: (this.editingOrder.items || [])
        .filter(i => i._delete && i.id)
        .map(i => i.id!)
    };

    this.loadingService.show();

    let request;
    if (this.editingOrder.id) {
      request = this.dataHandler.post(`${this.apiEndpoint}/${this.editingOrder.id}`, {
        ...payload,
        _method: 'PUT'
      });
    } else {
      request = this.dataHandler.post(this.apiEndpoint, payload);
    }

    request.pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.alertDialogService.open('Úspěch', 'Objednávka byla uložena.', 'success');
        this.showOrderForm = false;
        this.editingOrder = null;
        this.toggleBodyScroll(false);
        this.refreshData();
      },
      error: (err) => {
        const message = err.error?.message || 'Chyba při ukládání objednávky.';
        this.alertDialogService.open('Chyba', message, 'danger');
      }
    });
  }

  // ========== ROBUSTNÍ HELPERS (NA BÁZI KUPÓNU) ==========

  getCouponCode(couponId: any): string {
    if (!couponId) return '-';
    const idToFind = Number(couponId);
    const coupon = this.coupons.find(c => Number(c.id) === idToFind);
    return coupon ? coupon.code : 'N/A';
  }

  getPaymentMethodName(methodId: any): string {
    if (!methodId || methodId == 0) return '-';
    const idToFind = Number(methodId);
    const method = this.paymentMethods.find(m => Number(m.id) === idToFind);
    return method ? method.name : 'N/A';
  }

  getPaymentMethodPrice(methodId: any): number {
    if (!methodId || methodId == 0) return 0;
    const idToFind = Number(methodId);
    const method = this.paymentMethods.find(m => Number(m.id) === idToFind);
    return method ? Number(method.price) : 0;
  }

  getShippingMethodName(methodId: any): string {
    if (!methodId || methodId == 0) return '-';
    const idToFind = Number(methodId);
    const method = this.shippingMethods.find(s => Number(s.id) === idToFind);
    return method ? method.name : 'N/A';
  }

  getShippingMethodPrice(methodId: any): number {
    if (!methodId || methodId == 0) return 0;
    const idToFind = Number(methodId);
    const method = this.shippingMethods.find(s => Number(s.id) === idToFind);
    return method ? Number(method.base_price) : 0;
  }

  getCouponDisplayValue(couponOrId: any): string {
    let coupon = typeof couponOrId === 'object' ? couponOrId : null;
    if (!coupon && couponOrId) {
      const idToFind = Number(couponOrId);
      coupon = this.coupons.find(c => Number(c.id) === idToFind);
    }
    if (!coupon) return '';
    if (coupon.discount_type === 'percent') {
      return `-${coupon.discount_value}%`;
    }
    return `-${this.formatCurrency(coupon.discount_value)}`;
  }

  getCouponTypeLabel(couponId: any): string {
    if (!couponId) return '';
    const idToFind = Number(couponId);
    const coupon = this.coupons.find(c => Number(c.id) === idToFind);
    if (!coupon) return '';
    if (coupon.discount_type === 'percent') {
      return `-${coupon.discount_value}%`;
    }
    return `-${this.formatCurrency(coupon.discount_value)}`;
  }

  calculateSummaryTotals(): { baseAmount: number; vat: number; withVat: number } {
    if (!this.editingOrder) {
      return { baseAmount: 0, vat: 0, withVat: 0 };
    }
    const items = (this.editingOrder.items || []).filter(i => !i._delete);
    let productsWithVat = 0;
    items.forEach(item => {
      productsWithVat += item.quantity * item.unit_price;
    });
    const baseAmount = Math.round((productsWithVat / 1.21) * 100) / 100;
    const vat = Math.round((productsWithVat - baseAmount) * 100) / 100;
    return { baseAmount, vat, withVat: productsWithVat };
  }

  private validateOrder(): boolean {
    if (!this.editingOrder) return false;
    if (!this.editingOrder.customer_id) {
      this.alertDialogService.open('Validace', 'Vyberte zákazníka.', 'warning');
      return false;
    }
    if (!this.editingOrder.payment_method_id) {
      this.alertDialogService.open('Validace', 'Vyberte způsob platby.', 'warning');
      return false;
    }
    if (!this.editingOrder.shipping_method_id) {
      this.alertDialogService.open('Validace', 'Vyberte způsob dopravy.', 'warning');
      return false;
    }
    if (!this.editingOrder.items || this.editingOrder.items.filter(i => !i._delete).length === 0) {
      this.alertDialogService.open('Validace', 'Objednávka musí obsahovat alespoň jednu položku.', 'warning');
      return false;
    }
    if (!this.editingOrder.shipping_address) {
      this.alertDialogService.open('Validace', 'Zadejte dopravní adresu.', 'warning');
      return false;
    }
    return true;
  }

  closeOrderForm(): void {
    this.showOrderForm = false;
    this.editingOrder = null;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }

  // ========== ZÁKLADNÍ HELPERS ==========

  getCustomerName(customerId: number): string {
    if (!customerId) return '-';
    return this.customers.find(c => Number(c.id) === Number(customerId))?.full_name || 'N/A';
  }

  getProductName(productId: number): string {
    if (!productId) return '-';
    return this.products.find(p => Number(p.id) === Number(productId))?.name || 'N/A';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(value);
  }

  getStatusLabel(status: string): string {
    return this.statusOptions.find(o => o.value === status)?.label || status;
  }

  getPaymentStatusLabel(status: string): string {
    return this.paymentStatusOptions.find(o => o.value === status)?.label || status;
  }

  getVisibleItems(order: Order | null): OrderItem[] {
    return (order?.items || []).filter(i => !i._delete);
  }
}