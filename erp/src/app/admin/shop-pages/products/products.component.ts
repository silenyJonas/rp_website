import { Component, ViewChild, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces - přesuň později do separátních souborů
interface Variant {
  id?: number;
  variant_name: string;
  attribute_1_name?: string;
  attribute_1_value?: string;
  attribute_2_name?: string;
  attribute_2_value?: string;
  sku_variant?: string;
  price_modifier: number;
  stock_quantity: number;
  _delete?: boolean;
}

interface ProductImage {
  [key: string]: any;
  id?: number;
  image_path: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  file?: File;
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

  // Seznamy pro selecty
  categories: Category[] = [];
  suppliers: Supplier[] = [];

  // Modální okna
  showProductForm = false;
  showVariantsModal = false;
  showImagesModal = false;

  // Vybraný produkt
  selectedProduct: Product | null = null;
  editingProduct: Product | null = null;

  // Filtrování
  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedSupplierId: number | null = null;
  isActiveFilter: boolean | null = null;
  lowStockOnly = false;

  // Tabulka
  columns = [
    { key: 'id', header: 'ID', type: 'text' },
    { key: 'name', header: 'Název produktu', type: 'text' },
    { key: 'sku', header: 'SKU', type: 'text' },
    { key: 'category.name', header: 'Kategorie', type: 'text' },
    { key: 'supplier.name', header: 'Dodavatel', type: 'text' },
    { key: 'price', header: 'Cena', type: 'currency' },
    { key: 'stock_quantity', header: 'Na skladě', type: 'text' },
    { key: 'is_active', header: 'Aktivní', type: 'boolean' },
    { key: 'is_featured', header: 'Doporučeno', type: 'boolean' },
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
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Načíst kategorie pro select
   */
  private loadCategories(): void {
    this.dataHandler.getCollection<Category>('shop/categories?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při načítání kategorií:', err);
          this.alertDialogService.open('Chyba', 'Nepodařilo se načíst kategorie.', 'danger');
        }
      });
  }

  /**
   * Načíst dodavatele pro select
   */
  private loadSuppliers(): void {
    this.dataHandler.getCollection<Supplier>('shop/suppliers?no_pagination=true')
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.suppliers = data;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při načítání dodavatelů:', err);
          this.alertDialogService.open('Chyba', 'Nepodařilo se načíst dodavatele.', 'danger');
        }
      });
  }

  /**
   * Načíst produkty s filtrováním
   */
  override refreshData(): void {
    const filters: any = {
      sort_by: 'created_at',
      sort_direction: 'desc'
    };

    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    if (this.selectedCategoryId) {
      filters.category_id = this.selectedCategoryId;
    }
    if (this.selectedSupplierId) {
      filters.supplier_id = this.selectedSupplierId;
    }
    if (this.isActiveFilter !== null) {
      filters.is_active = this.isActiveFilter ? '1' : '0';
    }
    if (this.lowStockOnly) {
      filters.low_stock = 'true';
    }

    this.forceFullRefresh(filters);
  }

  // Tato metoda bezpečně vytáhne hodnotu i z vnořených objektů
// a hlavně "umlčí" chybu s indexováním.
getFieldValue(item: any, key: string): any {
  if (!item || !key) return null;
  
  // Rozdělí klíč podle teček (např. 'category.name' -> ['category', 'name'])
  return key.split('.').reduce((acc, part) => acc && acc[part], item);
}

  /**
   * Otevřít formulář pro nový produkt
   */
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

  /**
   * Otevřít formulář pro editaci produktu
   */
  openEditProductForm(product: Product): void {
    this.getItemDetails(product.id).subscribe({
      next: (fullProduct) => {
        this.editingProduct = { ...fullProduct };
        this.showProductForm = true;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.alertDialogService.open('Chyba', 'Nepodařilo se načíst detail produktu.', 'danger');
      }
    });
  }

  /**
   * Uložit produkt (vytvoření nebo aktualizace)
   */
/**
   * Uložit produkt (vytvoření nebo aktualizace)
   * Upraveno pro správné odesílání polí a souborů bez JSON.stringify
   */
  saveProduct(): void {
    if (!this.editingProduct || !this.validateProduct()) {
      return;
    }

    const formData = new FormData();

    // --- 1. Základní data produktu ---
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

    // --- 2. Obrázky (Přidání/Update) ---
    // Filtrujeme obrázky, které nejsou smazané
    const activeImages = (this.editingProduct.images || []).filter(img => !img._delete);
    activeImages.forEach((img, idx) => {
      // Pokud je to nový soubor
      if (img.file) {
        formData.append(`images[${idx}][file]`, img.file);
      }
      // Pokud editujeme existující, pošleme ID (aby backend věděl, co updatovat)
      if (img.id) {
        formData.append(`images[${idx}][id]`, img.id.toString());
      }
      formData.append(`images[${idx}][alt_text]`, img.alt_text || '');
      formData.append(`images[${idx}][is_primary]`, img.is_primary ? '1' : '0');
      formData.append(`images[${idx}][sort_order]`, img.sort_order.toString());
    });

    // --- 3. Smazané obrázky (Pole IDček) ---
    const imagesToDelete = (this.editingProduct.images || []).filter(img => img._delete && img.id);
    imagesToDelete.forEach((img, idx) => {
      formData.append(`delete_images[${idx}]`, img.id!.toString());
    });

    // --- 4. Varianty (Přidání/Update) ---
    const activeVariants = (this.editingProduct.variants || []).filter(v => !v._delete);
    activeVariants.forEach((v, idx) => {
      if (v.id) {
        formData.append(`variants[${idx}][id]`, v.id.toString());
      }
      formData.append(`variants[${idx}][variant_name]`, v.variant_name);
      formData.append(`variants[${idx}][attribute_1_name]`, v.attribute_1_name || '');
      formData.append(`variants[${idx}][attribute_1_value]`, v.attribute_1_value || '');
      formData.append(`variants[${idx}][attribute_2_name]`, v.attribute_2_name || '');
      formData.append(`variants[${idx}][attribute_2_value]`, v.attribute_2_value || '');
      formData.append(`variants[${idx}][sku_variant]`, v.sku_variant || '');
      formData.append(`variants[${idx}][price_modifier]`, v.price_modifier.toString());
      formData.append(`variants[${idx}][stock_quantity]`, v.stock_quantity.toString());
    });

    // --- 5. Smazané varianty (Pole IDček) ---
    const variantsToDelete = (this.editingProduct.variants || []).filter(v => v._delete && v.id);
    variantsToDelete.forEach((v, idx) => {
      formData.append(`delete_variants[${idx}]`, v.id!.toString());
    });

    this.loadingService.show();

    // Logika požadavku
    let request;
    if (this.editingProduct.id) {
      // Laravel vyžaduje u Multipart dat _method=PUT, i když je to POST request
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
        // Získání chybové hlášky z backendu
        const message = err.error?.message || 'Chyba při ukládání produktu.';
        this.alertDialogService.open('Chyba', message, 'danger');
      }
    });
  }

  /**
   * Smazat produkt
   */
  deleteProduct(product: Product): void {
    if (!product.id) return;

    const confirmMsg = product.is_featured 
      ? 'Tento produkt je označen jako doporučený. Opravdu si jej přejete smazat?' 
      : 'Opravdu si přejete smazat tento produkt?';

    if (confirm(confirmMsg)) {
      this.loadingService.show();
      this.deleteData(product.id).pipe(
        Core.finalize(() => {
          this.loadingService.hide();
          this.cd.markForCheck();
        }),
        Core.takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', 'Produkt byl smazán.', 'success');
          this.refreshData();
        },
        error: (err) => {
          this.alertDialogService.open('Chyba', 'Chyba při mazání produktu.', 'danger');
        }
      });
    }
  }

  /**
   * Otevřít modal pro správu variant
   */
  openVariantsModal(product: Product): void {
    this.selectedProduct = product;
    this.getItemDetails(product.id).subscribe({
      next: (fullProduct) => {
        if (!this.editingProduct) {
          this.editingProduct = { ...fullProduct };
        }
        this.showVariantsModal = true;
        this.cd.markForCheck();
      }
    });
  }

  /**
   * Přidat variantu
   */
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
      price_modifier: 0,
      stock_quantity: 0
    });

    this.cd.markForCheck();
  }

  /**
   * Smazat variantu
   */
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

  /**
   * Otevřít modal pro správu obrázků
   */
  openImagesModal(product: Product): void {
    this.selectedProduct = product;
    this.getItemDetails(product.id).subscribe({
      next: (fullProduct) => {
        if (!this.editingProduct) {
          this.editingProduct = { ...fullProduct };
        }
        this.showImagesModal = true;
        this.cd.markForCheck();
      }
    });
  }

  /**
   * Přidat obrázek
   */
  addImage(): void {
    if (!this.editingProduct) return;

    if (!this.editingProduct.images) {
      this.editingProduct.images = [];
    }

    this.editingProduct.images.push({
      image_path: '',
      alt_text: '',
      is_primary: this.editingProduct.images.length === 0,
      sort_order: this.editingProduct.images.length,
      file: undefined
    });

    this.cd.markForCheck();
  }

  /**
   * Smazat obrázek
   */
  deleteImage(index: number): void {
    if (!this.editingProduct?.images) return;

    const image = this.editingProduct.images[index];
    if (image.id) {
      image._delete = true;
    } else {
      this.editingProduct.images.splice(index, 1);
    }

    // Aktualizovat sort_order
    this.editingProduct.images.forEach((img, idx) => {
      if (!img._delete) {
        img.sort_order = idx;
      }
    });

    this.cd.markForCheck();
  }

  /**
   * Obsluha výběru souboru
   */
  onFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (file && this.editingProduct?.images) {
      this.editingProduct.images[index].file = file;
      this.editingProduct.images[index].image_path = file.name;
      this.cd.markForCheck();
    }
  }

  /**
   * Nastavit primární obrázek
   */
  setPrimaryImage(index: number): void {
    if (!this.editingProduct?.images) return;

    this.editingProduct.images.forEach((img, idx) => {
      img.is_primary = idx === index;
    });

    this.cd.markForCheck();
  }

  /**
   * Uzavřít modály
   */
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

  /**
   * Pomocné funkce
   */

  private validateProduct(): boolean {
    if (!this.editingProduct) return false;

    if (!this.editingProduct.name) {
      this.alertDialogService.open('Validace', 'Název produktu je povinný.', 'warning');
      return false;
    }

    if (this.editingProduct.price <= 0) {
      this.alertDialogService.open('Validace', 'Cena musí být větší než 0.', 'warning');
      return false;
    }

    if (!this.editingProduct.sku) {
      this.alertDialogService.open('Validace', 'SKU je povinný.', 'warning');
      return false;
    }

    if (this.editingProduct.category_id <= 0) {
      this.alertDialogService.open('Validace', 'Musíte vybrat kategorii.', 'warning');
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
    if (!supplierId) return 'Bez dodavatele';
    return this.suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  }

  getStockStatus(product: Product): string {
    if (product.stock_quantity <= 0) {
      return 'Vyprodáno';
    }
    if (product.stock_quantity <= product.stock_warning_level) {
      return '⚠️ Nízké zásoby';
    }
    return '✓ Na skladě';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(value);
  }

  getVariantTotalPrice(variant: Variant, basePrice: number): number {
    return basePrice + variant.price_modifier;
  }

  hasVariants(product: Product): any {
    return product.variants && product.variants.length > 0;
  }

  getVisibleVariants(product: Product | null): Variant[] {
    return (product?.variants || []).filter(v => !v._delete);
  }

  getVisibleImages(product: Product | null): ProductImage[] {
    return (product?.images || []).filter(img => !img._delete);
  }
}