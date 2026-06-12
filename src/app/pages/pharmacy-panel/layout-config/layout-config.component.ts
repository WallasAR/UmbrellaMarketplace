import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { LayoutItem, LayoutSection } from '../../../services/layout.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import {
  CAROUSEL_FILL_PRESETS,
  CAROUSEL_IMAGE_FIT_LABELS,
  CarouselImageFit,
  CarouselSlideMetadata,
  ensureCarouselMetadata,
  getCarouselMetadata,
  patchCarouselMetadata
} from '../../../utils/carousel-slide.util';
import {
  createDefaultPromoMosaicItems,
  createDefaultSpotlightItem,
  ensurePromoMosaicItem,
  getProductSpotlightMetadata,
  getPromoMosaicMetadata,
  PromoMosaicSlot
} from '../../../utils/layout-card.util';
import {
  buildProductSliderApiFilters,
  DEFAULT_PRODUCT_SLIDER_DISPLAY,
  DEFAULT_PRODUCT_SLIDER_FILTER,
  ensureProductSliderConfig,
  getProductSliderDisplay
} from '../../../utils/product-slider.util';

export interface PharmacyLayout {
  id?: string;
  name: string;
  isPreset?: boolean;
  is_active: boolean;
  sections: LayoutSection[];
}

type LayoutSectionWithProducts = LayoutSection & {
  products?: Product[];
  spotlightProduct?: Product | null;
};

interface ThemeConfig {
  primary_color: string;
}

@Component({
  selector: 'app-layout-config',
  standalone: false,
  templateUrl: './layout-config.component.html',
  styleUrl: './layout-config.component.css'
})
export class LayoutConfigComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  apiUrl = `${environment.apiUrl}/pharmacy/layout`;
  layout: PharmacyLayout | null = null;
  isLoading = true;
  isSaving = false;
  sidebarTab: 'components' | 'section' = 'components';
  sidebarOpen = true;
  readonly sidebarWidth = 380;

  editingSection: LayoutSection | null = null;
  selectedCarouselItemIndex = 0;
  productCategories: string[] = [];
  previewRevision = 0;

  toolbox = [
    { type: 'hero_carousel', label: 'Carrossel Principal', icon: 'M4 6h16M4 12h16M4 18h16' },
    { type: 'category_circles', label: 'Círculos de Categorias', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
    { type: 'product_slider', label: 'Vitrine de Produtos', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { type: 'promo_grid', label: 'Banners Promocionais', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { type: 'promo_mosaic', label: 'Mosaico Promocional', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { type: 'product_spotlight', label: 'Destaque de Produto', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.apiUrl = `${environment.apiUrl}/admin/layout`;
    }
    this.fetchLayout();
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.productCategories = categories || [];
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  touchPreview() {
    this.previewRevision += 1;
  }

  get displaySections(): LayoutSection[] {
    return this.layout?.sections.filter((s) => s.section_type !== 'theme_config') || [];
  }

  get primaryColor(): string {
    return this.themeConfig.primary_color || '#F74838';
  }

  loadPreset() {
    const message = this.isAdmin
      ? 'Restaurar o layout global para o padrão de fábrica? O layout publicado será substituído imediatamente.'
      : 'Deseja carregar o layout padrão? Isso substituirá suas seções atuais (não salva até você clicar em Publicar).';

    if (!confirm(message)) return;

    this.isLoading = true;

    if (this.isAdmin) {
      this.http.post<PharmacyLayout>(`${environment.apiUrl}/admin/layout/restore`, {}).subscribe({
        next: (restored) => {
          this.layout = restored;
          this.ensureThemeConfig();
          this.loadPreviewProducts();
          this.isLoading = false;
          this.toast.show('Layout padrão de fábrica restaurado.', 'success');
        },
        error: () => {
          this.isLoading = false;
          this.toast.show('Erro ao restaurar layout padrão.', 'error');
        }
      });
      return;
    }

    this.http.get<PharmacyLayout>(`${environment.apiUrl}/layout/factory-template`).subscribe({
      next: (preset) => this.applyFactoryTemplate(preset),
      error: () => {
        this.isLoading = false;
        this.toast.show('Erro ao carregar layout padrão.', 'error');
      }
    });
  }

  private applyFactoryTemplate(preset: PharmacyLayout) {
    if (!this.layout || !preset?.sections?.length) {
      this.isLoading = false;
      this.toast.show('Template de fábrica indisponível.', 'error');
      return;
    }

    const themeSection = this.layout.sections.find((s) => s.section_type === 'theme_config');
    const factorySections = preset.sections
      .filter((s) => s.section_type !== 'theme_config')
      .map((s) => ({
        ...s,
        id: crypto.randomUUID(),
        items: (s.items || []).map((i) => ({ ...i, id: crypto.randomUUID() }))
      }));

    this.layout.sections = themeSection
      ? [themeSection, ...factorySections]
      : factorySections;

    this.ensureThemeConfig();
    this.loadPreviewProducts();
    this.isLoading = false;
    this.toast.show('Layout padrão carregado no editor. Clique em Publicar para salvar.', 'info');
  }

  fetchLayout() {
    this.isLoading = true;
    this.http.get<PharmacyLayout[]>(this.apiUrl).subscribe({
      next: (layouts) => {
        const active = layouts.find((l) => l.is_active) || layouts.find((l) => l.isPreset) || layouts[0];
        this.layout = active || {
          name: this.isAdmin ? 'Layout Global' : 'Meu Layout Personalizado',
          is_active: true,
          sections: []
        };
        this.ensureThemeConfig();
        this.loadPreviewProducts();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.show('Erro ao carregar layout.', 'error');
      }
    });
  }

  loadPreviewProducts() {
    if (!this.layout) return;

    this.layout.sections.forEach((section) => {
      if (section.section_type === 'product_slider') {
        this.loadProductSliderProducts(section);
      }

      if (section.section_type === 'product_spotlight' && section.config?.product_id) {
        this.productService.getProductById(String(section.config.product_id)).subscribe({
          next: (product) => {
            (section as LayoutSectionWithProducts).spotlightProduct = product;
          },
          error: () => {
            (section as LayoutSectionWithProducts).spotlightProduct = null;
          }
        });
      }
    });
  }

  ensureThemeConfig() {
    if (!this.layout) return;
    let themeSection = this.layout.sections.find((s) => s.section_type === 'theme_config');
    if (!themeSection) {
      themeSection = {
        id: crypto.randomUUID(),
        section_type: 'theme_config',
        title: 'Theme Settings',
        display_order: -1,
        items: [],
        config: { primary_color: '#F74838' }
      };
      this.layout.sections.push(themeSection);
    }
  }

  get themeConfig(): ThemeConfig {
    if (!this.layout) return { primary_color: '#F74838' };
    const sec = this.layout.sections.find((s) => s.section_type === 'theme_config');
    if (!sec) return { primary_color: '#F74838' };
    if (!sec.config) sec.config = { primary_color: '#F74838' };
    return sec.config as ThemeConfig;
  }

  onThemeColorChange() {
    const color = this.themeConfig.primary_color;
    if (!color) return;
    document.documentElement.style.setProperty('--color-brand', color);
    document.documentElement.style.setProperty('--color-brand-soft', `${color}15`);
    document.documentElement.style.setProperty('--color-brand-hover', `${color}E6`);
    this.touchPreview();
  }

  drop(event: CdkDragDrop<any>) {
    if (!this.layout) return;

    const themeSections = this.layout.sections.filter((s) => s.section_type === 'theme_config');
    const display = this.layout.sections.filter((s) => s.section_type !== 'theme_config');

    if (event.previousContainer === event.container) {
      moveItemInArray(display, event.previousIndex, event.currentIndex);
    } else {
      const tool = event.previousContainer.data[event.previousIndex] as { type: string };
      const newSection: LayoutSection = {
        id: crypto.randomUUID(),
        section_type: tool.type,
        title: this.defaultSectionTitle(tool.type),
        display_order: event.currentIndex,
        items: [],
        config: {}
      };

      if (tool.type === 'promo_mosaic') {
        newSection.items = createDefaultPromoMosaicItems();
      } else if (tool.type === 'product_spotlight') {
        newSection.items = [createDefaultSpotlightItem()];
        newSection.config = { product_id: null };
      } else if (tool.type === 'product_slider') {
        newSection.config = {
          filter: { ...DEFAULT_PRODUCT_SLIDER_FILTER },
          display: { ...DEFAULT_PRODUCT_SLIDER_DISPLAY }
        };
      }

      display.splice(event.currentIndex, 0, newSection);
      this.editSection(newSection);
    }

    this.layout.sections = [...display, ...themeSections];
    this.loadPreviewProducts();
  }

  private defaultSectionTitle(type: string): string {
    const titles: Record<string, string> = {
      hero_carousel: 'Carrossel Principal',
      category_circles: 'Compre por Categoria',
      product_slider: 'Medicamentos em destaque',
      promo_grid: 'Ofertas Especiais',
      promo_mosaic: 'Mosaico Promocional',
      product_spotlight: 'Produto em Destaque'
    };
    return titles[type] || 'Nova Seção';
  }

  sectionLabel(section: LayoutSection): string {
    return this.toolbox.find((t) => t.type === section.section_type)?.label || section.section_type;
  }

  editSection(section: LayoutSection) {
    this.editingSection = section;
    this.sidebarTab = 'section';
    this.sidebarOpen = true;
    if (section.section_type === 'hero_carousel') {
      section.items?.forEach((item) => ensureCarouselMetadata(item, this.primaryColor));
      this.selectedCarouselItemIndex = 0;
    }
    if (section.section_type === 'product_spotlight') {
      if (!section.config) section.config = { product_id: null };
      if (!section.items?.length) section.items = [createDefaultSpotlightItem()];
    }
    if (section.section_type === 'promo_mosaic') {
      section.items?.forEach((item) => {
        const slot = getPromoMosaicMetadata(item).slot;
        ensurePromoMosaicItem(item, slot);
      });
    }
    if (section.section_type === 'product_slider') {
      ensureProductSliderConfig(section);
    }
  }

  isProductSliderGrid(): boolean {
    if (!this.editingSection) return false;
    return getProductSliderDisplay(this.editingSection).layout === 'grid';
  }

  onProductSliderFilterChange() {
    this.loadPreviewProducts();
    this.touchPreview();
  }

  onProductSliderDisplayChange() {
    if (!this.editingSection?.config?.display) return;
    const display = getProductSliderDisplay(this.editingSection);
    if (!display.pagination && display.layout === 'grid') {
      this.editingSection.config.display.items_per_page = display.columns * display.rows;
    }
    this.touchPreview();
  }

  private loadProductSliderProducts(section: LayoutSectionWithProducts) {
    const filters = buildProductSliderApiFilters(section);
    const sponsored = Boolean((filters as { sponsored?: boolean }).sponsored);
    delete (filters as { sponsored?: boolean }).sponsored;

    const request = sponsored
      ? this.productService.getSponsored()
      : this.productService.getProducts(filters);

    request.subscribe({
      next: (products) => {
        section.products = products;
        this.touchPreview();
      }
    });
  }

  isCarouselEditable(section: LayoutSection): boolean {
    return this.editingSection === section && section.section_type === 'hero_carousel';
  }

  selectCarouselItem(index: number) {
    this.selectedCarouselItemIndex = index;
    this.touchPreview();
  }

  carouselMetadata(item: LayoutItem): CarouselSlideMetadata {
    return getCarouselMetadata(item, this.primaryColor);
  }

  carouselFitOptions: CarouselImageFit[] = ['custom', 'cover', 'contain', 'fill'];

  carouselFitLabel(fit: CarouselImageFit): string {
    return CAROUSEL_IMAGE_FIT_LABELS[fit];
  }

  updateCarouselBackground(item: LayoutItem, color: string) {
    patchCarouselMetadata(item, { background_color: color }, this.primaryColor);
    this.touchPreview();
  }

  updateCarouselScale(item: LayoutItem, scale: number) {
    patchCarouselMetadata(item, { image_scale: Number(scale) }, this.primaryColor);
    this.touchPreview();
  }

  updateCarouselFit(item: LayoutItem, fit: CarouselImageFit) {
    patchCarouselMetadata(item, { image_fit: fit }, this.primaryColor);
    this.touchPreview();
  }

  applyCarouselPreset(item: LayoutItem, preset: keyof typeof CAROUSEL_FILL_PRESETS) {
    patchCarouselMetadata(item, CAROUSEL_FILL_PRESETS[preset], this.primaryColor);
    this.touchPreview();
  }

  onCarouselItemMetadataChange(event: { index: number; metadata: CarouselSlideMetadata }) {
    if (!this.editingSection?.items?.[event.index]) return;
    this.editingSection.items[event.index].metadata = { ...event.metadata };
  }

  mosaicMetadata(item: LayoutItem) {
    return getPromoMosaicMetadata(item);
  }

  spotlightMetadata(item: LayoutItem) {
    return getProductSpotlightMetadata(item);
  }

  spotlightFeaturesText(item: LayoutItem): string {
    return (getProductSpotlightMetadata(item).features || []).join('\n');
  }

  updateSpotlightFeatures(item: LayoutItem, value: string) {
    if (!item.metadata) item.metadata = {};
    item.metadata.features = value.split('\n').map((line) => line.trim()).filter(Boolean);
    this.touchPreview();
  }

  updateSpotlightProductId(section: LayoutSection, productId: string) {
    if (!section.config) section.config = {};
    section.config.product_id = productId ? Number(productId) : null;
    this.loadPreviewProducts();
  }

  mosaicSlotLabel(slot: PromoMosaicSlot): string {
    return slot === 'hero' ? 'Card principal (esquerda)' : slot === 'top' ? 'Card superior (direita)' : 'Card inferior (direita)';
  }

  updateMosaicSlot(item: LayoutItem, slot: PromoMosaicSlot) {
    ensurePromoMosaicItem(item, slot);
    this.touchPreview();
  }

  updateMosaicMeta(item: LayoutItem, key: string, value: string) {
    if (!item.metadata) item.metadata = {};
    item.metadata[key] = value;
    this.touchPreview();
  }

  closeEditor() {
    this.editingSection = null;
    this.sidebarTab = 'components';
  }

  removeSection(section: LayoutSection) {
    if (!this.layout) return;
    if (this.editingSection === section) {
      this.closeEditor();
    }
    this.layout.sections = this.layout.sections.filter((s) => s.id !== section.id);
  }

  addItem(section: LayoutSection) {
    if (section.section_type === 'product_spotlight') {
      this.toast.show('Destaque de produto usa apenas um card.', 'info');
      return;
    }

    if (section.section_type === 'promo_mosaic' && (section.items?.length || 0) >= 3) {
      this.toast.show('O mosaico promocional suporta até 3 cards.', 'info');
      return;
    }

    if (!section.items) section.items = [];
    const item: LayoutItem = {
      id: crypto.randomUUID(),
      display_order: section.items.length,
      title: '',
      image_url: ''
    };

    if (section.section_type === 'hero_carousel') {
      ensureCarouselMetadata(item, this.primaryColor);
    } else if (section.section_type === 'promo_mosaic') {
      const slots: PromoMosaicSlot[] = ['hero', 'top', 'bottom'];
      const used = new Set((section.items || []).map((i) => getPromoMosaicMetadata(i).slot));
      const slot = slots.find((s) => !used.has(s)) || 'hero';
      ensurePromoMosaicItem(item, slot);
    }

    section.items.push(item);
    if (section.section_type === 'hero_carousel') {
      this.selectedCarouselItemIndex = section.items.length - 1;
    }
    this.touchPreview();
  }

  removeItem(section: LayoutSection, index: number) {
    section.items?.splice(index, 1);
    if (section.section_type === 'hero_carousel') {
      this.selectedCarouselItemIndex = Math.max(0, Math.min(this.selectedCarouselItemIndex, (section.items?.length || 1) - 1));
    }
    this.touchPreview();
  }

  onImageSelected(event: Event, item: LayoutItem) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      item.file_data = result.split(',')[1];
      item.file_name = file.name;
      item.image_url = result;
      this.touchPreview();
    };
    reader.readAsDataURL(file);
  }

  private clearUploadedFileData() {
    if (!this.layout) return;
    this.layout.sections.forEach((section) => {
      section.items?.forEach((item) => {
        delete item.file_data;
        delete item.file_name;
      });
    });
  }

  saveLayout() {
    if (!this.layout) return;
    this.isSaving = true;

    this.layout.sections.forEach((s, idx) => {
      s.display_order = idx;
      s.items?.forEach((item, itemIdx) => {
        item.display_order = itemIdx;
      });
    });

    this.http.post(this.apiUrl, this.layout).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.show('Layout salvo com sucesso!', 'success');
        this.clearUploadedFileData();
        this.fetchLayout();
      },
      error: () => {
        this.isSaving = false;
        this.toast.show('Erro ao salvar layout.', 'error');
      }
    });
  }
}
