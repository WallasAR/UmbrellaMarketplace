import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';

export interface LayoutItem {
  id: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  display_order: number;
  file_data?: string;
  file_name?: string;
}

export interface LayoutSection {
  id: string;
  section_type: string;
  title: string;
  subtitle?: string;
  display_order: number;
  items: LayoutItem[];
  config?: any;
}

export interface PharmacyLayout {
  id?: string;
  name: string;
  isPreset?: boolean;
  is_active: boolean;
  sections: LayoutSection[];
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
  
  editingSection: LayoutSection | null = null;

  toolbox = [
    { type: 'hero_carousel', label: 'Carrossel Principal', icon: 'M4 6h16M4 12h16M4 18h16' },
    { type: 'category_circles', label: 'Círculos de Categorias', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
    { type: 'product_slider', label: 'Vitrine de Produtos', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { type: 'promo_grid', label: 'Banners Promocionais', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
  ];

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.apiUrl = `${environment.apiUrl}/admin/layout`;
    }
    this.fetchLayout();
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
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.show('Erro ao carregar layout.', 'error');
      }
    });
  }

  ensureThemeConfig() {
    if (!this.layout) return;
    let themeSection = this.layout.sections.find(s => s.section_type === 'theme_config');
    if (!themeSection) {
      themeSection = {
        id: crypto.randomUUID(),
        section_type: 'theme_config',
        title: 'Theme Settings',
        display_order: -1,
        items: [],
        config: { primary_color: '#F74838' }
      } as any;
      this.layout.sections.push(themeSection as LayoutSection);
    }
  }

  get themeConfig(): any {
    if (!this.layout) return {};
    const sec = this.layout.sections.find(s => s.section_type === 'theme_config');
    if (!sec) return {};
    if (!sec.config) sec.config = { primary_color: '#F74838' };
    return sec.config;
  }

  drop(event: CdkDragDrop<LayoutSection[] | any[]>) {
    if (!this.layout) return;

    if (event.previousContainer === event.container) {
      // Moving inside the same list
      moveItemInArray(this.layout.sections, event.previousIndex, event.currentIndex);
    } else {
      // Dragging from toolbox
      const itemType = event.previousContainer.data[event.previousIndex].type;
      const newSection: LayoutSection = {
        id: crypto.randomUUID(),
        section_type: itemType,
        title: itemType === 'hero_carousel' ? 'Carrossel Principal' : (itemType === 'product_slider' ? 'Vitrine de Produtos' : 'Nova Seção'),
        display_order: event.currentIndex,
        items: []
      };
      this.layout.sections.splice(event.currentIndex, 0, newSection);
      this.editSection(newSection);
    }
  }

  editSection(section: LayoutSection) {
    this.editingSection = section;
  }

  closeEditor() {
    this.editingSection = null;
  }

  removeSection(index: number) {
    if (!this.layout) return;
    if (this.editingSection === this.layout.sections[index]) {
      this.editingSection = null;
    }
    this.layout.sections.splice(index, 1);
  }

  addItem(section: LayoutSection) {
    section.items.push({
      id: crypto.randomUUID(),
      display_order: section.items.length,
      title: '',
      image_url: ''
    });
  }

  removeItem(section: LayoutSection, index: number) {
    section.items.splice(index, 1);
  }

  onImageSelected(event: any, item: LayoutItem) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        item.file_data = e.target.result.split(',')[1];
        item.file_name = file.name;
        item.image_url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveLayout() {
    if (!this.layout) return;
    this.isSaving = true;
    
    this.layout.sections.forEach((s, idx) => {
      s.display_order = idx;
      s.items.forEach((item, itemIdx) => {
        item.display_order = itemIdx;
      });
    });

    this.http.post(this.apiUrl, this.layout).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.show('Layout salvo com sucesso!', 'success');
        this.fetchLayout();
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.show('Erro ao salvar layout.', 'error');
      }
    });
  }
}
