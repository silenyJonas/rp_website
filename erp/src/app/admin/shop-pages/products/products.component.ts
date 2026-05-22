import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { PRODUCT_BUTTONS, PRODUCT_COLUMNS, TRASH_PRODUCT_COLUMNS, FILTER_COLUMNS, TOOLBAR_BUTTONS, PRODUCT_FORM_FIELDS } from './products.config';
import { Variant, ProductImage, Category, Supplier, Product } from './product-specific.interface';

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

  // Flag k prevenci double-click
  private isProcessing = false;

  filters: Core.FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  buttons = PRODUCT_BUTTONS;
  productColumns = PRODUCT_COLUMNS;
  trashProductColumns = TRASH_PRODUCT_COLUMNS;
  filterColumns = FILTER_COLUMNS;
  toolbarButtons = TOOLBAR_BUTTONS;
  formFields: any[] = [];

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private router: Core.Router,
    private confirmDialog: ConfirmDialogService
  ) {
    super(dataHandler, cd, genericTableService);
    console.log('[ProductsComponent] Inicializováno v konstruktoru.');
  }

  override ngOnInit(): void {
    console.log('[ProductsComponent] Spouštím ngOnInit.');
    super.ngOnInit();
    this.initWithAuthCheck(this.router);
    // Načteme konfiguraci polí z config souboru
    this.formFields = JSON.parse(JSON.stringify(PRODUCT_FORM_FIELDS));
    this.loadCategories();
    this.loadSuppliers();
    this.refreshData();
  }

  override ngOnDestroy(): void {
    console.log('[ProductsComponent] Komponenta se ničí (ngOnDestroy).');
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

  getTrashToolbarButtons(): any[] {
    return this.toolbarButtons.filter(btn => 
      btn.action !== 'handleCreateFormOpened' && 
      btn.action !== 'exportActiveTable'
    );
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

  handleCreateFormOpened(): void {
    if (this.isProcessing) return;
    
    console.log('[ProductsComponent] Otevírám formulář pro nový produkt.');
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
    this.updateFormFieldsOptions();
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
          this.updateFormFieldsOptions();
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
          this.updateFormFieldsOptions();
          this.cd.markForCheck();
        },
        error: (err) => console.error('Chyba při načítání dodavatelů:', err)
      });
  }

  private updateFormFieldsOptions(): void {
    this.formFields.forEach(field => {
      if (field.column_name === 'category_id') {
        field.options = this.categories.map(c => ({ value: c.id, label: c.name }));
      }
      if (field.column_name === 'supplier_id') {
        field.options = this.suppliers.map(s => ({ value: s.id, label: s.name }));
      }
    });

    this.filterColumns.forEach(filter => {
      if (filter.key === 'category_id') {
        filter.options = this.categories.map(c => ({ value: c.id, label: c.name }));
      }
      if (filter.key === 'supplier_id') {
        filter.options = this.suppliers.map(s => ({ value: s.id, label: s.name }));
      }
    });
  }

  // ========== DETAIL PRODUKTU ==========

  handleViewDetails(item: any): void {
    if (this.isProcessing || !item.id) return;
    
    console.log(`[handleViewDetails] Načítám detail pro ID: ${item.id}`);
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
      next: (fullProduct: any) => {
        console.log('[handleViewDetails] RAW data z API:', JSON.parse(JSON.stringify(fullProduct)));

        // Vytvoříme hlubokou kopii, aby nedošlo k mutaci původního stavu v Base komponentě
        const mappedProduct = { ...fullProduct };

        if (mappedProduct.prices) {
          console.log('[handleViewDetails] Nalezen objekt prices u produktu:', mappedProduct.prices);
          mappedProduct.price = mappedProduct.prices.price_czk_with_vat || mappedProduct.prices.price || 0;
          mappedProduct.cost_price = mappedProduct.prices.cost_price || 0;
        } else {
          console.warn('[handleViewDetails] POZOR: Objekt prices u hlavního produktu CHYBÍ!');
        }

        if (mappedProduct.variants) {
          console.log(`[handleViewDetails] Mapuji ceny pro ${mappedProduct.variants.length} variant.`);
          mappedProduct.variants = mappedProduct.variants.map((v: any, index: number) => {
            console.log(`[handleViewDetails] Varianta [${index}] RAW prices:`, v.prices);
            return {
              ...v,
              vat_rate: v.prices?.vat_rate ?? v.vat_rate ?? 21,
              price_with_vat: v.prices?.price_czk_with_vat ?? v.price_with_vat ?? 0,
              price_without_vat: v.prices?.price_czk_without_vat ?? v.price_without_vat ?? 0
            };
          });
        }

        console.log('[handleViewDetails] MAPOVANÝ produkt pro šablonu:', mappedProduct);
        this.selectedProductForDetail = mappedProduct;
        this.showDetailsModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('[handleViewDetails] Selhal odchyt detailu:', err);
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
    if (this.isProcessing) return;
    this.openEditProductForm(product);
  }

  openEditProductForm(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isProcessing || !product.id) return;

    console.log(`[openEditProductForm] Načítám produkt k editaci, ID: ${product.id}`);
    this.isProcessing = true;
    this.loadingService.show();
    
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct: any) => {
        console.log('[openEditProductForm] RAW data z API:', JSON.parse(JSON.stringify(fullProduct)));

        const mappedProduct = { ...fullProduct };

        if (mappedProduct.prices) {
          console.log('[openEditProductForm] Nalezen objekt prices u produktu:', mappedProduct.prices);
          mappedProduct.price = mappedProduct.prices.price_czk_with_vat || mappedProduct.prices.price || 0;
          mappedProduct.cost_price = mappedProduct.prices.cost_price || 0;
        } else {
          console.warn('[openEditProductForm] POZOR: Objekt prices u hlavního produktu CHYBÍ!');
        }

        if (mappedProduct.variants) {
          console.log(`[openEditProductForm] Mapuji ceny pro ${mappedProduct.variants.length} variant.`);
          mappedProduct.variants = mappedProduct.variants.map((v: any, index: number) => {
            console.log(`[openEditProductForm] Varianta [${index}] RAW prices:`, v.prices);
            return {
              ...v,
              vat_rate: v.prices?.vat_rate ?? v.vat_rate ?? 21,
              price_with_vat: v.prices?.price_czk_with_vat ?? v.price_with_vat ?? 0,
              price_without_vat: v.prices?.price_czk_without_vat ?? v.price_without_vat ?? 0
            };
          });
        }

        console.log('[openEditProductForm] FINÁLNÍ kopie pro editaci (editingProduct):', mappedProduct);
        this.editingProduct = mappedProduct;
        this.updateFormFieldsOptions();
        this.showProductForm = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('[openEditProductForm] Chyba při stahování produktu k editaci:', err);
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst detail produktu.', 'danger');
      }
    });
  }

  saveProduct(): void {
    if (this.isProcessing || !this.editingProduct || !this.validateProduct()) return;

    this.isProcessing = true;
    const formData = new FormData();

    console.log('[saveProduct] Odesílám data na backend. Aktuální stav objektu:', this.editingProduct);

    // Základní metadata produktu
    formData.append('category_id', this.editingProduct.category_id.toString());
    formData.append('supplier_id', (this.editingProduct.supplier_id || '').toString());
    formData.append('name', this.editingProduct.name);
    formData.append('slug', this.editingProduct.slug || this.generateSlug(this.editingProduct.name));
    formData.append('description', this.editingProduct.description || '');
    formData.append('short_description', this.editingProduct.short_description || '');
    formData.append('sku', this.editingProduct.sku);
    formData.append('stock_quantity', this.editingProduct.stock_quantity.toString());
    formData.append('stock_warning_level', this.editingProduct.stock_warning_level.toString());
    formData.append('is_active', this.editingProduct.is_active ? '1' : '0');
    formData.append('is_featured', this.editingProduct.is_featured ? '1' : '0');

    const defaultVatRate = this.editingProduct.variants?.[0]?.vat_rate ?? 21;
    const mainPriceWithVat = this.editingProduct.price || 0;
    const mainPriceWithoutVat = Math.round((mainPriceWithVat / (1 + defaultVatRate / 100)) * 100) / 100;

    formData.append('prices[vat_rate]', defaultVatRate.toString());
    formData.append('prices[price_czk_with_vat]', mainPriceWithVat.toString());
    formData.append('prices[price_czk_without_vat]', mainPriceWithoutVat.toString());
    formData.append('prices[cost_price]', (this.editingProduct.cost_price || 0).toString());

    // 1. OBRÁZKY PRODUKTU
    const activeProductImages = (this.editingProduct.images || []).filter(img => !img._delete && !img.variant_id);
    activeProductImages.forEach((img, idx) => {
      if (img.id) formData.append(`images[${idx}][id]`, img.id.toString());
      if (img.file) formData.append(`images[${idx}][file]`, img.file);
      formData.append(`images[${idx}][alt_text]`, img.alt_text || '');
      formData.append(`images[${idx}][is_primary]`, img.is_primary ? '1' : '0');
      formData.append(`images[${idx}][sort_order]`, img.sort_order.toString());
    });

    const imagesToDelete = (this.editingProduct.images || []).filter(img => img._delete && img.id && !img.variant_id);
    imagesToDelete.forEach((img, idx) => {
      formData.append(`delete_images[${idx}]`, img.id!.toString());
    });

    // 2. VARIANTY A JEJICH OBRÁZKY
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

      const vVatRate = v.vat_rate || 21;
      const vPriceWithVat = v.price_with_vat || 0;
      const vPriceWithoutVat = v.price_without_vat || Math.round((vPriceWithVat / (1 + vVatRate / 100)) * 100) / 100;

      formData.append(`variants[${idx}][prices][vat_rate]`, vVatRate.toString());
      formData.append(`variants[${idx}][prices][price_czk_with_vat]`, vPriceWithVat.toString());
      formData.append(`variants[${idx}][prices][price_czk_without_vat]`, vPriceWithoutVat.toString());

      if (v.images && v.images.length > 0) {
        const variantImagesToKeep = v.images.filter(img => !img._delete);
        variantImagesToKeep.forEach((img, imgIdx) => {
          if (img.id) formData.append(`variants[${idx}][images][${imgIdx}][id]`, img.id.toString());
          if (img.file) formData.append(`variants[${idx}][images][${imgIdx}][file]`, img.file);
          formData.append(`variants[${idx}][images][${imgIdx}][alt_text]`, img.alt_text || v.variant_name);
          formData.append(`variants[${idx}][images][${imgIdx}][is_primary]`, img.is_primary ? '1' : '0');
          formData.append(`variants[${idx}][images][${imgIdx}][sort_order]`, imgIdx.toString());
        });

        const variantImagesToDelete = v.images.filter(img => img._delete && img.id);
        variantImagesToDelete.forEach((img, delIdx) => {
          formData.append(`variants[${idx}][delete_images][${delIdx}]`, img.id!.toString());
        });
      }
    });

    const variantsToDelete = (this.editingProduct.variants || []).filter(v => v._delete && v.id);
    variantsToDelete.forEach((v, idx) => {
      formData.append(`delete_variants[${idx}]`, v.id!.toString());
    });

    this.loadingService.show();

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
        this.isProcessing = false;
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
        console.error('[saveProduct] Chyba při ukládání na backend:', err);
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
    if (this.isProcessing) return;

    console.log(`[openVariantsModal] Načítám varianty pro produkt ID: ${product.id}`);
    this.isProcessing = true;
    this.selectedProduct = product;
    this.loadingService.show();
    
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct: any) => {
        console.log('[openVariantsModal] RAW data z API:', JSON.parse(JSON.stringify(fullProduct)));

        const mappedProduct = { ...fullProduct };

        if (mappedProduct.variants) {
          mappedProduct.variants = mappedProduct.variants.map((v: any, index: number) => {
            console.log(`[openVariantsModal] Varianta [${index}] ceny mapovány.`);
            return {
              ...v,
              vat_rate: v.prices?.vat_rate ?? v.vat_rate ?? 21,
              price_with_vat: v.prices?.price_czk_with_vat ?? v.price_with_vat ?? 0,
              price_without_vat: v.prices?.price_czk_without_vat ?? v.price_without_vat ?? 0
            };
          });
        }

        this.editingProduct = mappedProduct;
        this.showVariantsModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('[openVariantsModal] Selhalo načítání variant:', err);
        this.isProcessing = false;
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst produkt.', 'danger');
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
      this.editingVariantImages = JSON.parse(JSON.stringify(variant.images || []));
    } else {
      this.editingVariantImages = [];
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

  onFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.alertDialogService.open('Příliš velký soubor', 'Obrázek může mít maximálně 5MB.', 'warning');
      event.target.value = '';
      return;
    }

    if (this.editingProduct?.images) {
      this.editingProduct.images[index].file = file;
      this.editingProduct.images[index].image_path = file.name;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingProduct!.images![index].url = e.target.result;
        this.cd.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  onVariantImageFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.alertDialogService.open('Příliš velký soubor', 'Obrázek může mít maximálně 5MB.', 'warning');
      event.target.value = '';
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
      this.editingProduct.variants[this.editingVariantIdx].images = this.editingVariantImages.map(img => ({
        ...img,
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
    this.editingVariantIdx = null;
    this.editingVariantImages = [];
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
    if (this.isProcessing) return;

    console.log(`[openImagesModal] Načítám obrázky pro produkt ID: ${product.id}`);
    this.isProcessing = true;
    this.selectedProduct = product;
    this.loadingService.show();
    
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.isProcessing = false;
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        this.editingProduct = { ...fullProduct };
        this.showImagesModal = true;
        this.toggleBodyScroll(true);
        this.cd.markForCheck();
      },
      error: () => {
        this.isProcessing = false;
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst produkt.', 'danger');
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
      sort_order: this.editingProduct.images.filter(img => !img.variant_id).length,
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

  formatCurrency(value: number, currency: string = 'CZK'): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
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