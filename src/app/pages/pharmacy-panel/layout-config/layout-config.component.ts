import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { LayoutItem, LayoutSection } from '../../../services/layout.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

export interface PharmacyLayout {
  id?: string;
  name: string;
  isPreset?: boolean;
  is_active: boolean;
  sections: LayoutSection[];
}

type LayoutSectionWithProducts = LayoutSection & { products?: Product[] };

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

  editingSection: LayoutSection | null = null;

  toolbox = [
    { type: 'hero_carousel', label: 'Carrossel Principal', icon: 'M4 6h16M4 12h16M4 18h16' },
    { type: 'category_circles', label: 'Círculos de Categorias', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
    { type: 'product_slider', label: 'Vitrine de Produtos', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { type: 'promo_grid', label: 'Banners Promocionais', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
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
      if (section.section_type !== 'product_slider') return;

      const filter = { ...(section.config?.filter || {}) };
      this.productService.getProducts(filter).subscribe({
        next: (products) => {
          (section as LayoutSectionWithProducts).products = products;
        }
      });
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
        items: []
      };
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
      promo_grid: 'Ofertas Especiais'
    };
    return titles[type] || 'Nova Seção';
  }

  sectionLabel(section: LayoutSection): string {
    return this.toolbox.find((t) => t.type === section.section_type)?.label || section.section_type;
  }

  editSection(section: LayoutSection) {
    this.editingSection = section;
    this.sidebarTab = 'section';
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
    if (!section.items) section.items = [];
    section.items.push({
      id: crypto.randomUUID(),
      display_order: section.items.length,
      title: '',
      image_url: ''
    });
  }

  removeItem(section: LayoutSection, index: number) {
    section.items?.splice(index, 1);
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
    };
    reader.readAsDataURL(file);
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
        this.fetchLayout();
      },
      error: () => {
        this.isSaving = false;
        this.toast.show('Erro ao salvar layout.', 'error');
      }
    });
  }
}
