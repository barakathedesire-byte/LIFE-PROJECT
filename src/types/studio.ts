export type StudioViewport = 'desktop' | 'tablet' | 'mobile';
export type StudioCanvasMode = 'design' | 'preview'; // design has selectable bounding boxes; preview is functional live test mode
export type StudioDockTab = 'build' | 'design' | 'data' | 'behavior' | 'platform' | 'manage';
export type StudioBuildSubTab = 'pages' | 'components' | 'sections' | 'templates' | 'global';

export type ComponentCategory = 
  | 'navigation' 
  | 'commerce' 
  | 'marketing' 
  | 'operations' 
  | 'dashboard' 
  | 'forms' 
  | 'system';

export type LumoPlatformMode = 
  | 'CUSTOMER' 
  | 'SELLER' 
  | 'RIDER' 
  | 'WAREHOUSE' 
  | 'PICKUP' 
  | 'SUPPORT' 
  | 'FINANCE' 
  | 'ADMIN'
  | 'OPERATIONS'
  | 'SALESPERSON';

export type ActionType = 
  | 'navigate' 
  | 'open_modal' 
  | 'open_drawer' 
  | 'add_to_cart' 
  | 'add_to_wishlist' 
  | 'open_product' 
  | 'open_seller' 
  | 'start_checkout' 
  | 'track_order' 
  | 'trigger_automation' 
  | 'call_api' 
  | 'toast';

export interface StudioActionConfig {
  type: ActionType;
  target?: string;
  payload?: Record<string, any>;
}

export interface StudioDataBinding {
  source: 'products' | 'sellers' | 'orders' | 'warehouses' | 'categories' | 'promotions' | 'delivery_runs' | 'static';
  categoryFilter?: string;
  sellerFilter?: string;
  statusFilter?: string;
  limit?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'sales';
}

export interface StudioComponentStyles {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  alignment?: 'left' | 'center' | 'right';
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  mobileColumns?: 1 | 2;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  customClass?: string;
}

export interface StudioComponentItem {
  id: string;
  type: string;
  name: string;
  category: ComponentCategory;
  isGlobal?: boolean;
  globalId?: string;
  props: Record<string, any>;
  styles: StudioComponentStyles;
  dataBinding?: StudioDataBinding;
  action?: StudioActionConfig;
  roleRestriction?: string[]; // If empty, all roles can see it
  animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in';
}

export interface StudioPageSection {
  id: string;
  name: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  components: StudioComponentItem[];
}

export interface StudioPageConfig {
  id: string;
  name: string;
  slug: string;
  mode: LumoPlatformMode;
  route: string;
  icon?: string;
  description?: string;
  isPublished?: boolean;
  isSystem?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
  sections: StudioPageSection[];
}

export type StudioPage = StudioPageConfig;

export interface DesignSystemTokens {
  brandPrimary: string;
  brandDark: string;
  brandSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  surfaceLight: string;
  surfaceDark: string;
  fontHeading: string;
  fontBody: string;
  fontSizeBase: number;
  scaleRatio: number;
  radiusBase: string;
  buttonVariant: 'solid' | 'outline' | 'soft';
}

export interface GlobalComponentDef {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  instanceCount: number;
  component: StudioComponentItem;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  pageId?: string;
  componentId?: string;
  fixable?: boolean;
}

export interface ValidationResult {
  score: number; // 0 - 100
  passed: boolean;
  issues: ValidationIssue[];
}

export interface PlatformMapNode {
  id: string;
  title: string;
  mode: LumoPlatformMode;
  category: string;
  description: string;
  apiEndpoint?: string;
  status: 'active' | 'synced' | 'pending';
}

export interface PlatformMapLink {
  source: string;
  target: string;
  label: string;
  type: 'data' | 'event' | 'logistics' | 'payment';
}
