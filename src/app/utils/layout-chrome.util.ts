export interface ChromeLinkItem {
  id: string;
  label: string;
  link_url: string;
  visible: boolean;
  highlight?: boolean;
  external?: boolean;
}

export interface FooterColumnConfig {
  id: string;
  title: string;
  visible: boolean;
  links: ChromeLinkItem[];
}

export interface SocialLinkConfig {
  id: string;
  label: string;
  url: string;
  visible: boolean;
}

export interface NavbarConfig {
  visible: boolean;
  logo_url: string;
  logo_alt: string;
  logo_link: string;
  logo_file_data?: string;
  logo_file_name?: string;
  show_search: boolean;
  search_placeholder: string;
  show_location: boolean;
  location_label: string;
  location_value: string;
  show_cart: boolean;
  show_profile: boolean;
  show_category_bar: boolean;
  category_links: ChromeLinkItem[];
}

export interface FooterConfig {
  visible: boolean;
  logo_url: string;
  logo_alt: string;
  brand_name: string;
  brand_tagline: string;
  description: string;
  logo_file_data?: string;
  logo_file_name?: string;
  show_social: boolean;
  social_links: SocialLinkConfig[];
  columns: FooterColumnConfig[];
  show_contact: boolean;
  contact_address: string;
  contact_email: string;
  copyright: string;
  show_payment_badges: boolean;
}

export interface ThemeLayoutConfig {
  primary_color?: string;
  navbar?: Partial<NavbarConfig>;
  footer?: Partial<FooterConfig>;
}

const uid = () => crypto.randomUUID();

export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  visible: true,
  logo_url: 'nav-logo.svg',
  logo_alt: 'Umbrella Corporation',
  logo_link: '/home',
  show_search: true,
  search_placeholder: 'Pesquisar medicamentos, vitaminas...',
  show_location: true,
  location_label: 'Entregar em',
  location_value: 'Raccoon City',
  show_cart: true,
  show_profile: true,
  show_category_bar: true,
  category_links: [
    { id: uid(), label: 'Comprar por Categoria', link_url: '/category', visible: true, highlight: true },
    { id: uid(), label: 'Menos de R$ 50', link_url: '/home', visible: true },
    { id: uid(), label: '✧ Lançamentos', link_url: '/home', visible: true },
    { id: uid(), label: '✓ Mais Vendidos', link_url: '/home', visible: true },
    { id: uid(), label: '% Novas Ofertas', link_url: '/home', visible: true },
    { id: uid(), label: 'Higiene Pessoal', link_url: '/home', visible: true },
    { id: uid(), label: 'Vitaminas & Suplementos', link_url: '/home', visible: true },
    { id: uid(), label: 'Mãe & Bebê', link_url: '/home', visible: true }
  ]
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  visible: true,
  logo_url: 'nav-logo.svg',
  logo_alt: 'Umbrella Farmácia',
  brand_name: 'Umbrella Marketplace',
  brand_tagline: '',
  description: 'Tornando a saúde simples, segura e acessível. A sua farmácia completa online com entrega expressa para toda a região.',
  show_social: true,
  social_links: [
    { id: uid(), label: 'LinkedIn', url: 'https://www.linkedin.com/in/wallasar', visible: true },
    { id: uid(), label: 'GitHub', url: 'https://github.com/WallasAR', visible: true },
    { id: uid(), label: 'Instagram', url: 'https://www.instagram.com/war_ggez/', visible: true }
  ],
  columns: [
    {
      id: uid(),
      title: 'Links Úteis',
      visible: true,
      links: [
        { id: uid(), label: 'Início', link_url: '/home', visible: true },
        { id: uid(), label: 'Comprar por Categoria', link_url: '/category', visible: true },
        { id: uid(), label: 'Farmácias Próximas', link_url: '/pharmacies/nearby', visible: true },
        { id: uid(), label: 'Sobre a Umbrella', link_url: '/about', visible: true }
      ]
    },
    {
      id: uid(),
      title: 'Legal',
      visible: true,
      links: [
        { id: uid(), label: 'Repositório Open Source', link_url: 'https://github.com/WallasAR/UmbrellaMarketplace', visible: true, external: true },
        { id: uid(), label: 'Documentação da API', link_url: 'https://umbrellacorp-api.onrender.com/docs/', visible: true, external: true },
        { id: uid(), label: 'Licença MIT', link_url: 'https://opensource.org/license/mit', visible: true, external: true },
        { id: uid(), label: 'FAQs', link_url: '/faqs', visible: true }
      ]
    }
  ],
  show_contact: true,
  contact_address: 'Av. Arklay Mountains, 1998\nRaccoon City, RC',
  contact_email: 'suporte@umbrellacorp.com',
  copyright: '© 2026 Umbrella Corporation™. All Rights Reserved.',
  show_payment_badges: true
};

function mergeLinks(raw: Partial<ChromeLinkItem>[] | undefined, fallback: ChromeLinkItem[]): ChromeLinkItem[] {
  if (!raw?.length) return fallback.map((item) => ({ ...item }));
  return raw.map((item, index) => ({
    id: item.id || uid(),
    label: item.label || fallback[index]?.label || 'Link',
    link_url: item.link_url || fallback[index]?.link_url || '/home',
    visible: item.visible !== false,
    highlight: item.highlight === true,
    external: item.external === true
  }));
}

export function getNavbarConfig(theme?: ThemeLayoutConfig | null): NavbarConfig {
  const raw = theme?.navbar || {};
  const base = DEFAULT_NAVBAR_CONFIG;
  return {
    visible: raw.visible !== false,
    logo_url: raw.logo_url || base.logo_url,
    logo_alt: raw.logo_alt || base.logo_alt,
    logo_link: raw.logo_link || base.logo_link,
    logo_file_data: raw.logo_file_data,
    logo_file_name: raw.logo_file_name,
    show_search: raw.show_search !== false,
    search_placeholder: raw.search_placeholder || base.search_placeholder,
    show_location: raw.show_location !== false,
    location_label: raw.location_label || base.location_label,
    location_value: raw.location_value || base.location_value,
    show_cart: raw.show_cart !== false,
    show_profile: raw.show_profile !== false,
    show_category_bar: raw.show_category_bar !== false,
    category_links: mergeLinks(raw.category_links, base.category_links)
  };
}

export function getFooterConfig(theme?: ThemeLayoutConfig | null): FooterConfig {
  const raw = theme?.footer || {};
  const base = DEFAULT_FOOTER_CONFIG;
  const columns = raw.columns?.length
    ? raw.columns.map((col, index) => ({
        id: col.id || uid(),
        title: col.title || base.columns[index]?.title || 'Coluna',
        visible: col.visible !== false,
        links: mergeLinks(col.links, base.columns[index]?.links || [])
      }))
    : base.columns.map((col) => ({ ...col, links: col.links.map((l) => ({ ...l })) }));

  return {
    visible: raw.visible !== false,
    logo_url: raw.logo_url || base.logo_url,
    logo_alt: raw.logo_alt || base.logo_alt,
    brand_name: raw.brand_name || base.brand_name,
    brand_tagline: raw.brand_tagline || base.brand_tagline,
    description: raw.description || base.description,
    logo_file_data: raw.logo_file_data,
    logo_file_name: raw.logo_file_name,
    show_social: raw.show_social !== false,
    social_links: (raw.social_links?.length ? raw.social_links : base.social_links).map((item, index) => ({
      id: item.id || uid(),
      label: item.label || base.social_links[index]?.label || 'Social',
      url: item.url || base.social_links[index]?.url || '#',
      visible: item.visible !== false
    })),
    columns,
    show_contact: raw.show_contact !== false,
    contact_address: raw.contact_address || base.contact_address,
    contact_email: raw.contact_email || base.contact_email,
    copyright: raw.copyright || base.copyright,
    show_payment_badges: raw.show_payment_badges !== false
  };
}

export function ensureThemeChromeConfig(config: ThemeLayoutConfig): ThemeLayoutConfig {
  const next = { ...config };
  next.navbar = getNavbarConfig(next);
  next.footer = getFooterConfig(next);
  return next;
}

export function visibleLinks(links: ChromeLinkItem[]): ChromeLinkItem[] {
  return links.filter((link) => link.visible !== false);
}
