
import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ========== INTERFACES ==========
interface Variant {
  id?: number;
  variant_name: string;
  attribute_1_name?: string;
  attribute_1_value?: string;
  attribute_2_name?: string;
  attribute_2_value?: string;
  sku_variant?: string;
  price_with_vat: number;
  vat_rate: number;
  price_without_vat: number;
  stock_quantity: number;
  images?: ProductImage[];
  _delete?: boolean;
}

interface ProductImage {
  [key: string]: any;
  id?: number;
  product_id?: number;
  variant_id?: number;
  image_path: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  file?: File;
  url?: string;
  _delete?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  category_id: number;
  supplier_id?: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  sku: string;
  stock_quantity: number;
  stock_warning_level: number;
  is_active: boolean;
  is_featured: boolean;
  images?: ProductImage[];
  variants?: Variant[];
  category?: Category;
  supplier?: Supplier;
  created_at?: string;
  updated_at?: string;
}

interface FilterState {
  search: string;
  id?: string;
  name?: string;
  sku?: string;
  category_id: number | null;
  supplier_id: number | null;
  price_from?: number;
  price_to?: number;
  stock_level?: number; // stock_quantity >= this
  is_active: boolean | null;
  variant_count?: number; // má minimálně N variant
  low_stock: boolean;
  sort_by: string;
  sort_direction: string;
}

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

  filterState: FilterState = {
    search: '',
    id: '',
    name: '',
    sku: '',
    category_id: null,
    supplier_id: null,
    price_from: undefined,
    price_to: undefined,
    stock_level: undefined,
    is_active: null,
    variant_count: undefined,
    low_stock: false,
    sort_by: 'created_at',
    sort_direction: 'desc'
  };

  columns = [
    { key: 'id', header: 'ID', type: 'text', width: '10%' },
    { key: 'name', header: 'Produkt', type: 'text', width: '10%' },
    { key: 'sku', header: 'SKU', type: 'text', width: '10%' },
    { key: 'category.name', header: 'Kat.', type: 'text', width: '10%' },
    { key: 'supplier.name', header: 'Dodavatel', type: 'text', width: '10%' },
    { key: 'price', header: 'Cena', type: 'currency', width: '10%' },
    { key: 'stock_quantity', header: 'Sklad', type: 'text', width: '10%' },
    { key: 'is_active', header: 'Aktiv.', type: 'boolean', width: '10%' },
  ];

  trashColumns = [
    { key: 'id', header: 'ID', type: 'text', width: '50px' },
    { key: 'name', header: 'Produkt', type: 'text', width: 'auto' },
    { key: 'deleted_at', header: 'Smazáno', type: 'date', width: '120px' },
  ];

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private router: Core.Router
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

  // ========== FILTROVÁNÍ ==========

  override refreshData(): void {
    const filters: any = {
      sort_by: this.filterState.sort_by,
      sort_direction: this.filterState.sort_direction
    };

    if (this.filterState.id) filters.id = this.filterState.id;
    if (this.filterState.name) filters.name = this.filterState.name;
    if (this.filterState.sku) filters.sku = this.filterState.sku;
    if (this.filterState.search) filters.search = this.filterState.search;
    if (this.filterState.category_id) filters.category_id = this.filterState.category_id;
    if (this.filterState.supplier_id) filters.supplier_id = this.filterState.supplier_id;
    if (this.filterState.price_from !== undefined) filters.price_from = this.filterState.price_from;
    if (this.filterState.price_to !== undefined) filters.price_to = this.filterState.price_to;
    if (this.filterState.stock_level !== undefined) filters.stock_level = this.filterState.stock_level;
    if (this.filterState.is_active !== null) filters.is_active = this.filterState.is_active ? '1' : '0';
    if (this.filterState.variant_count !== undefined) filters.variant_count = this.filterState.variant_count;
    if (this.filterState.low_stock) filters.low_stock = 'true';

    this.forceFullRefresh(filters);
  }

  clearFilters(): void {
    this.filterState = {
      search: '',
      id: '',
      name: '',
      sku: '',
      category_id: null,
      supplier_id: null,
      price_from: undefined,
      price_to: undefined,
      stock_level: undefined,
      is_active: null,
      variant_count: undefined,
      low_stock: false,
      sort_by: 'created_at',
      sort_direction: 'desc'
    };
    this.refreshData();
  }

  changeSorting(sortBy: string): void {
    if (this.filterState.sort_by === sortBy) {
      this.filterState.sort_direction = this.filterState.sort_direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.filterState.sort_by = sortBy;
      this.filterState.sort_direction = 'asc';
    }
    this.refreshData();
  }

  getFieldValue(item: any, key: string): any {
    if (!item || !key) return null;
    return key.split('.').reduce((acc, part) => acc && acc[part], item);
  }

  // ========== PRODUKTY - FORMULÁŘ ==========

  openNewProductForm(): void {
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
    this.cd.markForCheck();
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
          fullProduct.variants = fullProduct.variants.map(v => {
            const mappedVariant: Variant = {
              ...v,
              price_with_vat: v.price_with_vat || 0,
              vat_rate: v.vat_rate || 21,
              price_without_vat: v.price_without_vat || 0
            };
            return mappedVariant;
          });
        }
        this.editingProduct = { ...fullProduct };
        this.showProductForm = true;
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

    // Obrázky produktu (bez variant_id)
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

      // Variant-specific images
      const variantImages = (v.images || []).filter(img => !img._delete && img.variant_id === v.id);
      variantImages.forEach((img, imgIdx) => {
        if (img.id) formData.append(`variants[${idx}][images][${imgIdx}][id]`, img.id.toString());
        if (img.file) formData.append(`variants[${idx}][images][${imgIdx}][file]`, img.file);
        formData.append(`variants[${idx}][images][${imgIdx}][alt_text]`, img.alt_text || '');
        formData.append(`variants[${idx}][images][${imgIdx}][sort_order]`, img.sort_order.toString());
      });
    });

    // Smazané varianty
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
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.alertDialogService.open('Úspěch', 'Produkt byl uložen.', 'success');
        this.showProductForm = false;
        this.editingProduct = null;
        this.refreshData();
      },
      error: (err) => {
        const message = err.error?.message || err.error?.errors || 'Chyba při ukládání produktu.';
        this.alertDialogService.open('Chyba', this.formatErrorMessage(message), 'danger');
      }
    });
  }

  deleteProduct(product: Product, isForceDelete: boolean = false, event?: Event): void {
    if (event) event.stopPropagation();
    if (!product.id) return;

    const msg = isForceDelete
      ? 'TRVALE smazat produkt? Jde o nevratnou operaci!'
      : product.is_featured
      ? 'Tento produkt je doporučený. Smazat do koše?'
      : 'Smazat do koše?';

    if (confirm(msg)) {
      this.loadingService.show();
      this.deleteData(product.id, isForceDelete).pipe(
        Core.finalize(() => {
          this.loadingService.hide();
          this.cd.markForCheck();
        }),
        Core.takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', isForceDelete ? 'Produkt trvale smazán.' : 'Produkt smazán do koše.', 'success');
          this.refreshData();
        },
        error: () => {
          this.alertDialogService.open('Chyba', 'Chyba při mazání.', 'danger');
        }
      });
    }
  }

  // ========== DETAILY PRODUKTU ==========

  openProductDetails(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    
    this.loadingService.show();
    this.getItemDetails(product.id).pipe(
      Core.finalize(() => this.loadingService.hide()),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: (fullProduct) => {
        this.selectedProductForDetail = fullProduct;
        this.showDetailsModal = true;
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
    this.cd.markForCheck();
  }

  // ========== SOFT DELETE ==========

  restoreProduct(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    if (!product.id) return;

    if (confirm('Obnovit tento produkt?')) {
      this.loadingService.show();
      this.restoreDataFromApi(product.id).pipe(
        Core.finalize(() => {
          this.loadingService.hide();
          this.cd.markForCheck();
        }),
        Core.takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', 'Produkt obnoven.', 'success');
          this.refreshData();
        },
        error: () => {
          this.alertDialogService.open('Chyba', 'Chyba při obnově.', 'danger');
        }
      });
    }
  }

  deleteAllTrashed(): void {
    if (!confirm('TRVALE smazat VŠECHNY smazané produkty? Nevratná operace!')) return;

    this.loadingService.show();
    this.hardDeleteAllTrashedDataFromApi().pipe(
      Core.finalize(() => {
        this.loadingService.hide();
        this.cd.markForCheck();
      }),
      Core.takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.alertDialogService.open('Úspěch', 'Koš vyprázdněn.', 'success');
        this.showTrashTable = false;
        this.refreshData();
      },
      error: () => {
        this.alertDialogService.open('Chyba', 'Chyba při mazání.', 'danger');
      }
    });
  }

  // ========== VARIANTY ==========

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
        this.cd.markForCheck();
      }
    });
  }

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

  deleteVariant(index: number): void {
    if (!this.editingProduct?.variants) return;

    const variant = this.editingProduct.variants[index];
    if (variant.id) {
      variant._delete = true;
    } else {
      this.editingProduct.variants.splice(index, 1);
    }

    this.cd.markForCheck();
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

  onVariantImageFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (file && this.editingVariantImages) {
      this.editingVariantImages[index].file = file;
      this.editingVariantImages[index].image_path = file.name;
      
      // Vytvoř preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editingVariantImages[index].url = e.target.result;
        this.cd.markForCheck();
      };
      reader.readAsDataURL(file);
      this.cd.markForCheck();
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

  getVariantImagePreview(image: ProductImage): string {
    if (image.url) return image.url;
    if (image.file) {
      const reader = new FileReader();
      let result = '';
      reader.onload = (e: any) => result = e.target.result;
      reader.readAsDataURL(image.file);
      return result;
    }
    return image.image_path ? `storage/products/${image.image_path}` : '';
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

  deleteImage(index: number): void {
    if (!this.editingProduct?.images) return;

    const image = this.editingProduct.images[index];
    if (image.id) {
      image._delete = true;
    } else {
      this.editingProduct.images.splice(index, 1);
    }

    this.editingProduct.images.forEach((img, idx) => {
      if (!img._delete && !img.variant_id) {
        img.sort_order = idx;
      }
    });

    this.cd.markForCheck();
  }

  onFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (file && this.editingProduct?.images) {
      this.editingProduct.images[index].file = file;
      this.editingProduct.images[index].image_path = file.name;
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

  // ========== MODÁLY - CLOSE ==========

  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
    this.cd.markForCheck();
  }

  closeVariantsModal(): void {
    this.showVariantsModal = false;
    this.cd.markForCheck();
  }

  closeImagesModal(): void {
    this.showImagesModal = false;
    this.cd.markForCheck();
  }

  // ========== VALIDACE & HELPERS ==========

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

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name || 'N/A';
  }

  getSupplierName(supplierId?: number): string {
    if (!supplierId) return '-';
    return this.suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  }

  getProductImagePreview(image: ProductImage): string {
    if (image.url) return image.url;
    if (image.file) {
      const reader = new FileReader();
      let result = '';
      reader.onload = (e: any) => result = e.target.result;
      reader.readAsDataURL(image.file);
      return result;
    }
    return image.image_path ? `storage/products/${image.image_path}` : '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(value);
  }

  hasVariants(product: Product): boolean {
    return product.variants ? product.variants.length > 0 : false;
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

  toggleTrashTable(): void {
    this.showTrashTable = !this.showTrashTable;
    if (this.showTrashTable) {
      const trashFilters = { ...this.filterState, only_trashed: 'true' };
      this.forceFullRefresh(trashFilters);
    } else {
      this.refreshData();
    }
  }

  override toggleFilters(): void {
    this.showFiltersPanel = !this.showFiltersPanel;
    this.cd.markForCheck();
  }
}