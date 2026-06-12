import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LayoutChromeService } from '../../services/layout-chrome.service';
import { FooterConfig, FooterColumnConfig, visibleLinks } from '../../utils/layout-chrome.util';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnChanges {
  @Input() config: FooterConfig | null = null;
  @Input() previewMode = false;
  @Input() accentColor = '#F74838';

  displayConfig: FooterConfig;

  constructor(private chromeService: LayoutChromeService) {
    this.displayConfig = this.chromeService.footer;
  }

  ngOnInit() {
    this.syncConfig();
    if (!this.config && !this.previewMode) {
      this.chromeService.footer$.subscribe((cfg) => {
        this.displayConfig = cfg;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.syncConfig();
    }
  }

  get cfg(): FooterConfig {
    return this.displayConfig;
  }

  visibleColumns(): FooterColumnConfig[] {
    return (this.cfg.columns || []).filter((col) => col.visible !== false);
  }

  visibleColumnLinks(column: FooterColumnConfig) {
    return visibleLinks(column.links);
  }

  visibleSocialLinks() {
    return (this.cfg.social_links || []).filter((item) => item.visible !== false);
  }

  addressLines(): string[] {
    return (this.cfg.contact_address || '').split('\n').map((line) => line.trim()).filter(Boolean);
  }

  private syncConfig() {
    this.displayConfig = this.config || this.chromeService.footer;
  }
}
