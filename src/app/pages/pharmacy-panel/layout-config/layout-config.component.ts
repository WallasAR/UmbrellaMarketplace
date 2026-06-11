import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface LayoutItem {
  id: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  display_order: number;
}

export interface LayoutSection {
  id: string;
  section_type: string;
  title: string;
  subtitle?: string;
  display_order: number;
  items: LayoutItem[];
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
  apiUrl = `${environment.apiUrl}/pharmacy/layout`;
  layout: PharmacyLayout | null = null;
  isLoading = true;
  isSaving = false;
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLayout();
  }

  fetchLayout() {
    this.isLoading = true;
    this.http.get<PharmacyLayout[]>(this.apiUrl).subscribe({
      next: (layouts) => {
        // Find active layout, or create default
        this.layout = layouts.find(l => l.is_active) || {
          name: 'Meu Layout Personalizado',
          is_active: true,
          sections: []
        };
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  addSection(type: string) {
    if (!this.layout) return;
    const newOrder = this.layout.sections.length;
    this.layout.sections.push({
      id: crypto.randomUUID(),
      section_type: type,
      title: type === 'banner_grid' ? 'Meus Banners' : 'Nova Categoria',
      display_order: newOrder,
      items: []
    });
  }

  removeSection(index: number) {
    if (!this.layout) return;
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

  saveLayout() {
    if (!this.layout) return;
    this.isSaving = true;
    
    // Auto-fix display_order before saving
    this.layout.sections.forEach((s, idx) => {
      s.display_order = idx;
      s.items.forEach((item, itemIdx) => {
        item.display_order = itemIdx;
      });
    });

    this.http.post(this.apiUrl, this.layout).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Layout salvo com sucesso!');
        this.fetchLayout();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Erro ao salvar layout: ' + err.message);
      }
    });
  }
}
