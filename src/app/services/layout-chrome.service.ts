import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  FooterConfig,
  getFooterConfig,
  getNavbarConfig,
  NavbarConfig,
  ThemeLayoutConfig
} from '../utils/layout-chrome.util';
import { LayoutService } from './layout.service';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class LayoutChromeService {
  private navbarSubject = new BehaviorSubject<NavbarConfig>(getNavbarConfig());
  private footerSubject = new BehaviorSubject<FooterConfig>(getFooterConfig());

  readonly navbar$ = this.navbarSubject.asObservable();
  readonly footer$ = this.footerSubject.asObservable();

  constructor(
    private layoutService: LayoutService,
    private tenantService: TenantService
  ) {}

  get navbar(): NavbarConfig {
    return this.navbarSubject.value;
  }

  get footer(): FooterConfig {
    return this.footerSubject.value;
  }

  applyFromThemeConfig(theme?: ThemeLayoutConfig | null): void {
    this.navbarSubject.next(getNavbarConfig(theme || undefined));
    this.footerSubject.next(getFooterConfig(theme || undefined));
  }

  loadPublicChrome(pharmacyId?: string): void {
    this.layoutService.getPublicLayout(pharmacyId).subscribe({
      next: (layout) => {
        const theme = layout.sections?.find((s) => s.section_type === 'theme_config');
        this.applyFromThemeConfig(theme?.config);
      },
      error: () => {
        this.applyFromThemeConfig(null);
      }
    });
  }

  initFromTenant(): void {
    const pharmacyId = this.tenantService.getTenantId() || undefined;
    this.loadPublicChrome(pharmacyId);
  }
}
