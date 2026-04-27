import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { PRODUCT_BUTTONS, PRODUCT_COLUMNS, TRASH_PRODUCT_COLUMNS, FILTER_COLUMNS, TOOLBAR_BUTTONS } from './products.config';
import { Variant, ProductImage, Category, Supplier, Product } from './product-specific.interface';
// ========== INTERFACES ==========


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SHARED_UI_BUILDERS],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent extends BaseDataComponent<Product> implements OnInit, OnDestroy {
  override apiEndpoint: string = 'shop/products';
  @ViewChild('activeTable') activeTable!: any;
  categories: Category[] = [];
  suppliers: Supplier[] = [];

  showProductForm = false;
  showVariantsModal = false;
  showImagesModal = false;
  showDetailsModal = false;
  override showTrashTable = false;
  showFiltersPanel = false;

  selectedProductForDetail: Product | null = null;
  selectedProduct: Product | null = null;
  editingProduct: Product | null = null;
  editingVariantIdx: number | null = null;
  editingVariantImages: ProductImage[] = [];

  filters: Core.FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  // Config z PRODUCT_BUTTONS, PRODUCT_COLUMNS atd.
  buttons = PRODUCT_BUTTONS;
  productColumns = PRODUCT_COLUMNS;
  trashProductColumns = TRASH_PRODUCT_COLUMNS;
  filterColumns = FILTER_COLUMNS;
  toolbarButtons = TOOLBAR_BUTTONS;
  formFields: any[] = []; // Není potřeba pro table-builder, ale lze tu přidat

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
    this.loadCategories();
    this.loadSuppliers();
    this.refreshData();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.toggleBodyScroll(false);
  }

  // ========== BODY SCROLL HELPER ==========

  private toggleBodyScroll(lock: boolean): void {
    if (lock) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  // ========== TOOLBAR ACTIONS ==========

  handleToolbarAction(action: string): void {
    const actions: { [key: string]: () => void } = {
      toggleFilters: () => this.toggleFilters(),
      handleCreateFormOpened: () => this.handleCreateFormOpened(),
      toggleTable: () => this.toggleTable(),
      exportActiveTable: () => this.exportActiveTable()
    };
    if (actions[action]) actions[action]();
  }

  // NAHRADIT PŮVODNÍ PRÁZDNOU FUNKCI:
  exportActiveTable(): void {
    if (this.activeTable) {
      // Zavolá metodu exportToCSV přímo v komponentě table-builder
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

  handleCreateFormOpened(): void {
    this.editingProduct = {
      category_id: 0,
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: 0,
      cost_price: 0,
      sku: '',
      stock_quantity: 0,
      stock_warning_level: 10,
      is_active: true,
      is_featured: false,
      images: [],
      variants: []
    };
    this.showProductForm = true;
    this.toggleBodyScroll(true);
    this.cd.markForCheck();
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
    this.filters = { sort_by: 'id', sort_direction: 'desc' };
    this.refreshData();
  }

  handlePageChange(page: number): void {
    this.onHandlePageChange(page, this.filters);
  }

  handleItemsPerPageChange(value: number): void {
    this.onHandleItemsPerPageChange(value, this.filters);
  }

  // ========== KATEGORIE & DODAVATELÉ ==========

  private loadCategories(): void {
    this.dataHandler.getCollection<Category>('shop/categories?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání kategorií:', err)
      });
  }

  private loadSuppliers(): void {
    this.dataHandler.getCollection<Supplier>('shop/suppliers?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání dodavatelů:', err)
      });
  }

  // ========== DETAIL PRODUKTU ==========

  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.loadingService.show();
    this.getItemDetails(item.id).pipe(
      Core.finalize(() => this.loadingService.hide()),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        this.selectedProductForDetail = fullProduct;
        this.showDetailsModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: () => {
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst detaily.', 'danger');
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProductForDetail = null;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }

  // ========== EDITACE PRODUKTU ==========

  handleEditFormOpened(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.openEditProductForm(product);
  }

  openEditProductForm(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    if (!product.id) return;

    this.loadingService.show();
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => this.loadingService.hide()),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        if (fullProduct.variants) {
          fullProduct.variants = fullProduct.variants.map(v => ({
            ...v,
            price_with_vat: v.price_with_vat || 0,
            vat_rate: v.vat_rate || 21,
            price_without_vat: v.price_without_vat || 0
          }));
        }
        this.editingProduct = { ...fullProduct };
        this.showProductForm = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: () => {
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst detail produktu.', 'danger');
      }
    });
  }

  saveProduct(): void {
    if (!this.editingProduct || !this.validateProduct()) return;

    const formData = new FormData();

    formData.append('category_id', this.editingProduct.category_id.toString());
    formData.append('supplier_id', (this.editingProduct.supplier_id || '').toString());
    formData.append('name', this.editingProduct.name);
    formData.append('slug', this.editingProduct.slug || this.generateSlug(this.editingProduct.name));
    formData.append('description', this.editingProduct.description || '');
    formData.append('short_description', this.editingProduct.short_description || '');
    formData.append('price', this.editingProduct.price.toString());
    formData.append('cost_price', (this.editingProduct.cost_price || 0).toString());
    formData.append('sku', this.editingProduct.sku);
    formData.append('stock_quantity', this.editingProduct.stock_quantity.toString());
    formData.append('stock_warning_level', this.editingProduct.stock_warning_level.toString());
    formData.append('is_active', this.editingProduct.is_active ? '1' : '0');
    formData.append('is_featured', this.editingProduct.is_featured ? '1' : '0');

    // Obrázky produktu
    const activeProductImages = (this.editingProduct.images || []).filter(img => !img._delete && !img.variant_id);
    activeProductImages.forEach((img, idx) => {
      if (img.id) formData.append(`images[${idx}][id]`, img.id.toString());
      if (img.file) formData.append(`images[${idx}][file]`, img.file);
      formData.append(`images[${idx}][alt_text]`, img.alt_text || '');
      formData.append(`images[${idx}][is_primary]`, img.is_primary ? '1' : '0');
      formData.append(`images[${idx}][sort_order]`, img.sort_order.toString());
    });

    // Smazané obrázky
    const imagesToDelete = (this.editingProduct.images || []).filter(img => img._delete && img.id);
    imagesToDelete.forEach((img, idx) => {
      formData.append(`delete_images[${idx}]`, img.id!.toString());
    });

    // Varianty
    const activeVariants = (this.editingProduct.variants || []).filter(v => !v._delete);
    activeVariants.forEach((v, idx) => {
      if (v.id) formData.append(`variants[${idx}][id]`, v.id.toString());
      formData.append(`variants[${idx}][variant_name]`, v.variant_name);
      formData.append(`variants[${idx}][attribute_1_name]`, v.attribute_1_name || '');
      formData.append(`variants[${idx}][attribute_1_value]`, v.attribute_1_value || '');
      formData.append(`variants[${idx}][attribute_2_name]`, v.attribute_2_name || '');
      formData.append(`variants[${idx}][attribute_2_value]`, v.attribute_2_value || '');
      formData.append(`variants[${idx}][sku_variant]`, v.sku_variant || '');
      formData.append(`variants[${idx}][stock_quantity]`, v.stock_quantity.toString());
      formData.append(`variants[${idx}][vat_rate]`, (v.vat_rate || 21).toString());
      formData.append(`variants[${idx}][price_with_vat]`, (v.price_with_vat || 0).toString());
      formData.append(`variants[${idx}][price_without_vat]`, (v.price_without_vat || 0).toString());

      // PŘIDÁNO: Mapování obrázků přímo pod variantu pro Laravel prefix "variants.{$idx}.images"
      if (v.images && v.images.length > 0) {
        const variantImages = v.images.filter(img => !img._delete);
        variantImages.forEach((img, imgIdx) => {
          if (img.id) formData.append(`variants[${idx}][images][${imgIdx}][id]`, img.id.toString());
          if (img.file) formData.append(`variants[${idx}][images][${imgIdx}][file]`, img.file);
          formData.append(`variants[${idx}][images][${imgIdx}][alt_text]`, img.alt_text || v.variant_name);
          formData.append(`variants[${idx}][images][${imgIdx}][is_primary]`, img.is_primary ? '1' : '0');
          formData.append(`variants[${idx}][images][${imgIdx}][sort_order]`, imgIdx.toString());
        });
      }
    });

    const variantsToDelete = (this.editingProduct.variants || []).filter(v => v._delete && v.id);
    variantsToDelete.forEach((v, idx) => {
      formData.append(`delete_variants[${idx}]`, v.id!.toString());
    });

    this.loadingService.show();
    // Do saveProduct() před odesláním:
    formData.forEach((value, key) => {
      if (key.includes('[file]')) {
        console.log('Odesílám soubor:', key, value);
      }
    });

    let request;
    if (this.editingProduct.id) {
      formData.append('_method', 'PUT');
      request = this.dataHandler.post(`${this.apiEndpoint}/${this.editingProduct.id}`, formData);
    } else {
      request = this.dataHandler.post(this.apiEndpoint, formData);
    }

    request.pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.alertDialogService.open('Úspěch', 'Produkt byl uložen.', 'success');
        this.showProductForm = false;
        this.editingProduct = null;
        this.toggleBodyScroll(false);
        this.refreshData();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.errors || 'Chyba při ukládání produktu.';
        this.alertDialogService.open('Chyba', this.formatErrorMessage(message), 'danger');
      }
    });
  }
  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }
  openVariantsModal(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedProduct = product;
    this.loadingService.show();
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => this.loadingService.hide()),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        if (!this.editingProduct) {
          this.editingProduct = { ...fullProduct };
        }
        this.showVariantsModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      }
    });
  }
  // ========== VARIANTY ==========

  addVariant(): void {
    if (!this.editingProduct) return;
    if (!this.editingProduct.variants) {
      this.editingProduct.variants = [];
    }
    this.editingProduct.variants.push({
      variant_name: '',
      attribute_1_name: '',
      attribute_1_value: '',
      attribute_2_name: '',
      attribute_2_value: '',
      sku_variant: '',
      price_with_vat: 0,
      vat_rate: 21,
      price_without_vat: 0,
      stock_quantity: 0,
      images: []
    });
    this.cd.markForCheck();
  }

  async deleteVariant(index: number): Promise<void> {
    if (!this.editingProduct?.variants) return;
    const variant = this.editingProduct.variants[index];

    const confirmed = await this.confirmDialog.open(
      'Smazat variantu', 
      `Opravdu chcete smazat variantu ${variant.variant_name || ''}?`
    );

    if (confirmed) {
      if (variant.id) {
        variant._delete = true;
      } else {
        this.editingProduct.variants.splice(index, 1);
      }
      this.cd.markForCheck();
    }
  }

  editVariantImages(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingVariantIdx = index;
    const variant = this.editingProduct?.variants?.[index];
    if (variant) {
      this.editingVariantImages = [...(variant.images || [])];
    }
    this.cd.markForCheck();
  }

  addVariantImage(): void {
    this.editingVariantImages.push({
      image_path: '',
      alt_text: '',
      is_primary: false,
      sort_order: this.editingVariantImages.length,
      file: undefined
    });
    this.cd.markForCheck();
  }

  deleteVariantImage(index: number): void {
    const img = this.editingVariantImages[index];
    if (img.id) {
      img._delete = true;
    } else {
      this.editingVariantImages.splice(index, 1);
    }
    this.cd.markForCheck();
  }

// Metoda pro hlavní obrázky produktu
  onFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Kontrola velikosti (5MB = 5 * 1024 * 1024 bajtů)
    if (file.size > 5 * 1024 * 1024) {
      this.alertDialogService.open('Příliš velký soubor', 'Obrázek může mít maximálně 5MB.', 'warning');
      event.target.value = ''; // Reset inputu
      return;
    }

    if (this.editingProduct?.images) {
      this.editingProduct.images[index].file = file;
      this.editingProduct.images[index].image_path = file.name;
      
      // Volitelně vytvoření náhledu i pro hlavní obrázky, pokud jej používáte
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingProduct!.images![index].url = e.target.result;
        this.cd.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  // Metoda pro obrázky variant
  onVariantImageFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Kontrola velikosti (5MB = 5 * 1024 * 1024 bajtů)
    if (file.size > 5 * 1024 * 1024) {
      this.alertDialogService.open('Příliš velký soubor', 'Obrázek může mít maximálně 5MB.', 'warning');
      event.target.value = ''; // Reset inputu
      return;
    }

    if (this.editingVariantImages[index]) {
      this.editingVariantImages[index].file = file; 
      this.editingVariantImages[index].image_path = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingVariantImages[index].url = e.target.result;
        this.cd.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  get currentEditingVariant() {
    if (this.editingVariantIdx === null || !this.editingProduct?.variants) return null;
    return this.editingProduct.variants[this.editingVariantIdx];
  }

  saveVariantImages(): void {
    if (this.editingVariantIdx !== null && this.editingProduct?.variants?.[this.editingVariantIdx]) {
      // Musíme přenést celé pole včetně File objektů
      // Mapování zajistí, že se přenesou všechny vlastnosti (alt_text, file, url atd.)
      this.editingProduct.variants[this.editingVariantIdx].images = this.editingVariantImages.map(img => ({
        ...img,
        // Explicitně se ujistíme, že ID varianty je správně nastaveno
        variant_id: this.editingProduct?.variants?.[this.editingVariantIdx!]?.id 
      }));

      this.editingVariantIdx = null;
      this.editingVariantImages = [];
      this.cd.markForCheck();
    }
  }
  closeVariantsModal(): void {
    this.showVariantsModal = false;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }

  // ========== DPH VÝPOČTY ==========

  onVATRateChange(variant: Variant): void {
    this.calculatePriceWithoutVAT(variant);
    this.cd.markForCheck();
  }

  onPriceWithVATChange(variant: Variant): void {
    this.calculatePriceWithoutVAT(variant);
    this.cd.markForCheck();
  }

  private calculatePriceWithoutVAT(variant: Variant): void {
    if (variant.price_with_vat && variant.vat_rate !== undefined && variant.vat_rate !== null) {
      const rate = 1 + (variant.vat_rate / 100);
      variant.price_without_vat = Math.round((variant.price_with_vat / rate) * 100) / 100;
    }
  }

  // ========== OBRÁZKY PRODUKTU ==========

  openImagesModal(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedProduct = product;
    this.loadingService.show();
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => this.loadingService.hide()),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        if (!this.editingProduct) {
          this.editingProduct = { ...fullProduct };
        }
        this.showImagesModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      }
    });
  }

  addImage(): void {
    if (!this.editingProduct) return;
    if (!this.editingProduct.images) {
      this.editingProduct.images = [];
    }
    this.editingProduct.images.push({
      image_path: '',
      alt_text: '',
      is_primary: this.editingProduct.images.filter(img => !img.variant_id).length === 0,
      sort_order: this.editingProduct.images.length,
      file: undefined
    });
    this.cd.markForCheck();
  }

  async deleteImage(index: number): Promise<void> {
    const confirmed = await this.confirmDialog.open(
      'Smazat obrázek', 
      'Opravdu si přejete odstranit tento obrázek?'
    );

    if (confirmed && this.editingProduct?.images) {
      const image = this.editingProduct.images[index];
      if (image.id) {
        image._delete = true;
      } else {
        this.editingProduct.images.splice(index, 1);
      }
      // Přepočet sort_order
      this.editingProduct.images.forEach((img, idx) => {
        if (!img._delete && !img.variant_id) img.sort_order = idx;
      });
      this.cd.markForCheck();
    }
  }



  setPrimaryImage(index: number): void {
    if (!this.editingProduct?.images) return;
    this.editingProduct.images.forEach((img, idx) => {
      img.is_primary = idx === index && !img.variant_id;
    });
    this.cd.markForCheck();
  }

  closeImagesModal(): void {
    this.showImagesModal = false;
    this.toggleBodyScroll(false);
    this.cd.markForCheck();
  }

  // ========== HELPERS ==========

  private validateProduct(): boolean {
    if (!this.editingProduct) return false;

    if (!this.editingProduct.name) {
      this.alertDialogService.open('Validace', 'Název je povinný.', 'warning');
      return false;
    }

    if (this.editingProduct.price <= 0) {
      this.alertDialogService.open('Validace', 'Cena musí být > 0.', 'warning');
      return false;
    }

    if (!this.editingProduct.sku) {
      this.alertDialogService.open('Validace', 'SKU je povinný.', 'warning');
      return false;
    }

    if (this.editingProduct.category_id <= 0) {
      this.alertDialogService.open('Validace', 'Vyberte kategorii.', 'warning');
      return false;
    }

    return true;
  }

  public generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  getSupplierName(supplierId?: number): string {
    if (!supplierId) return '-';
    return this.suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(value);
  }

  getVisibleVariants(product: Product | null): Variant[] {
    return (product?.variants || []).filter(v => !v._delete);
  }

  getVisibleImages(product: Product | null, variantId?: number): ProductImage[] {
    const images = product?.images || [];
    return variantId
      ? images.filter(img => !img._delete && img.variant_id === variantId)
      : images.filter(img => !img._delete && !img.variant_id);
  }

  private formatErrorMessage(err: any): string {
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (typeof err === 'object') {
      return Object.values(err).flat().join(', ');
    }
    return 'Neznámá chyba';
  }
}