import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ChatProvider } from './context/ChatContext';
import { CompareProvider } from './context/CompareContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { PlatformConfigProvider } from './context/PlatformConfigContext';

// Layout & Global Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { BuyerSellerChatModal } from './components/common/BuyerSellerChatModal';
import { CompareFloatingBar } from './components/common/CompareFloatingBar';

// Phase 1 Pages
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { FlashSalesPage } from './pages/FlashSalesPage';
import { DealsOfDayPage } from './pages/DealsOfDayPage';
import { OfficialStoresPage } from './pages/OfficialStoresPage';
import { TopSellersPage } from './pages/TopSellersPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { FreeDeliveryZonesPage } from './pages/FreeDeliveryZonesPage';
import { SupermarketPage } from './pages/SupermarketPage';
import { SaveTheDatePage } from './pages/SaveTheDatePage';
import { SameDayDeliveryPage } from './pages/SameDayDeliveryPage';
import { BecomeVendorPage } from './pages/BecomeVendorPage';
import { BecomeRiderPage } from './pages/BecomeRiderPage';
import { BecomeLumoForcePage } from './pages/BecomeLumoForcePage';
import { BecomePickupPointPage } from './pages/BecomePickupPointPage';
import { SellerEducationPage } from './pages/SellerEducationPage';
import { PhonesTabletsPage } from './pages/PhonesTabletsPage';
import { ElectronicsAudioPage } from './pages/ElectronicsAudioPage';
import { ComputersLaptopsPage } from './pages/ComputersLaptopsPage';
import { HomeLivingPage } from './pages/HomeLivingPage';
import { AppliancesPage } from './pages/AppliancesPage';
import { FashionApparelPage } from './pages/FashionApparelPage';
import { BeautyHealthPage } from './pages/BeautyHealthPage';
import { SportsFitnessPage } from './pages/SportsFitnessPage';
import { AutomotivePage } from './pages/AutomotivePage';
import { BabiesKidsPage } from './pages/BabiesKidsPage';
import { AllMarketplacePage } from './pages/AllMarketplacePage';
import { SponsoredProductsPage } from './pages/SponsoredProductsPage';
import { TrendingEssentialsPage } from './pages/TrendingEssentialsPage';
import { BrandStoreDetailPage } from './pages/BrandStoreDetailPage';
import { WineAndSpiritsPage } from './pages/WineAndSpiritsPage';
import { GiftCollectionsPage } from './pages/GiftCollectionsPage';
import { CategoryPage } from './pages/CategoryPage';
import { LiveShoppingDiscoveryPage } from './pages/live/LiveShoppingDiscoveryPage';
import { BuyerLiveStreamPage } from './pages/live/BuyerLiveStreamPage';
import { PageLoader } from './components/common/PageLoader';

// Phase 2 Multi-Role Workspaces
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SalespersonPortalPage } from './pages/sales/SalespersonPortalPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { StaffActivationPage } from './pages/staff/StaffActivationPage';
import { OperationsDashboardPage } from './pages/operations/OperationsDashboardPage';
import { WarehouseDashboardPage } from './pages/warehouse/WarehouseDashboardPage';
import { DeliveryAgentPortalPage } from './pages/delivery/DeliveryAgentPortalPage';
import { PickupStationPortalPage } from './pages/pickup/PickupStationPortalPage';
import { CustomerSupportPortalPage } from './pages/support/CustomerSupportPortalPage';
import { ModerationPortalPage } from './pages/moderation/ModerationPortalPage';
import { FinanceDashboardPage } from './pages/finance/FinanceDashboardPage';
import { CatalogDashboardPage } from './pages/catalog/CatalogDashboardPage';
import { ReturnsPage } from './pages/account/ReturnsPage';
import { WalletPage } from './pages/account/WalletPage';
import { StudioPage } from './pages/studio/StudioPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const internalPrefixes = ['/seller', '/warehouse', '/sales', '/operations', '/delivery', '/rider', '/pickup', '/admin', '/support', '/customercare', '/moderation', '/catalog', '/finance', '/studio'];
  const isInternalRoute = internalPrefixes.some(prefix => location.pathname.startsWith(prefix));
  const isStudioRoute = location.pathname.startsWith('/studio');

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#0f172a] flex flex-col font-sans selection:bg-[#ff6a00] selection:text-white">
      {/* Main & Utility Header (Only displayed in Customer Storefront Mode) */}
      {!isInternalRoute && <Header />}

      {/* Page Content Container */}
      <main className="flex-1">
        <Routes>
          {/* Phase 1 Consumer Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/category/phones-tablets" element={<PhonesTabletsPage />} />
          <Route path="/category/electronics" element={<ElectronicsAudioPage />} />
          <Route path="/category/electronics-audio" element={<ElectronicsAudioPage />} />
          <Route path="/category/computers" element={<ComputersLaptopsPage />} />
          <Route path="/category/computers-laptops" element={<ComputersLaptopsPage />} />
          <Route path="/category/home-living" element={<HomeLivingPage />} />
          <Route path="/category/home-office" element={<HomeLivingPage />} />
          <Route path="/category/appliances" element={<AppliancesPage />} />
          <Route path="/category/fashion" element={<FashionApparelPage />} />
          <Route path="/category/beauty-health" element={<BeautyHealthPage />} />
          <Route path="/category/groceries" element={<SupermarketPage />} />
          <Route path="/category/supermarket" element={<SupermarketPage />} />
          <Route path="/category/sports-outdoors" element={<SportsFitnessPage />} />
          <Route path="/category/sports-fitness" element={<SportsFitnessPage />} />
          <Route path="/category/automotive" element={<AutomotivePage />} />
          <Route path="/category/babies-kids" element={<BabiesKidsPage />} />
          <Route path="/category/kids-babies" element={<BabiesKidsPage />} />
          <Route path="/category/wine-spirits" element={<WineAndSpiritsPage />} />
          <Route path="/gift-collections" element={<GiftCollectionsPage />} />
          <Route path="/marketplace" element={<AllMarketplacePage />} />
          <Route path="/all-marketplace" element={<AllMarketplacePage />} />
          <Route path="/products" element={<AllMarketplacePage />} />
          <Route path="/sponsored-products" element={<SponsoredProductsPage />} />
          <Route path="/sponsored" element={<SponsoredProductsPage />} />
          <Route path="/trending" element={<TrendingEssentialsPage />} />
          <Route path="/trending-essentials" element={<TrendingEssentialsPage />} />
          <Route path="/trending-essentials-best-value" element={<TrendingEssentialsPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/brand/:brand" element={<ProductListingPage />} />
          <Route path="/search" element={<ProductListingPage />} />
          
          {/* Live Commerce Feature Pages */}
          <Route path="/live" element={<LiveShoppingDiscoveryPage />} />
          <Route path="/live-shopping" element={<LiveShoppingDiscoveryPage />} />
          <Route path="/live/:sessionId" element={<BuyerLiveStreamPage />} />
          <Route path="/live/watch/:sessionId" element={<BuyerLiveStreamPage />} />

          {/* Dedicated Feature Pages */}
          <Route path="/deals" element={<DealsOfDayPage />} />
          <Route path="/deals-of-the-day" element={<DealsOfDayPage />} />
          <Route path="/flash-sales" element={<FlashSalesPage />} />
          <Route path="/official-stores" element={<OfficialStoresPage />} />
          <Route path="/official-stores/:brandSlug" element={<BrandStoreDetailPage />} />
          <Route path="/top-sellers" element={<TopSellersPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/free-delivery" element={<FreeDeliveryZonesPage />} />
          <Route path="/free-delivery-zones" element={<FreeDeliveryZonesPage />} />
          <Route path="/supermarket" element={<SupermarketPage />} />
          <Route path="/save-the-date" element={<SaveTheDatePage />} />
          <Route path="/same-day-delivery" element={<SameDayDeliveryPage />} />
          <Route path="/vendor/register" element={<BecomeVendorPage />} />
          <Route path="/sell-on-lumo" element={<BecomeVendorPage />} />
          <Route path="/rider/register" element={<BecomeRiderPage />} />
          <Route path="/become-rider" element={<BecomeRiderPage />} />
          <Route path="/sales/register" element={<BecomeLumoForcePage />} />
          <Route path="/become-lumoforce" element={<BecomeLumoForcePage />} />
          <Route path="/pickup/register" element={<BecomePickupPointPage />} />
          <Route path="/become-pickup-point" element={<BecomePickupPointPage />} />
          <Route path="/seller-education" element={<SellerEducationPage />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/account/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/account/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/help" element={<HelpCenterPage />} />

          {/* Phase 2 Multi-Role Workspaces */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['SELLER', 'SUPER_ADMIN']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute allowedRoles={['SELLER', 'SUPER_ADMIN']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['SALESPERSON', 'SUPER_ADMIN']}>
                <SalespersonPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/*"
            element={
              <ProtectedRoute allowedRoles={['SALESPERSON', 'SUPER_ADMIN']}>
                <SalespersonPortalPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/staff/login" element={<AdminLoginPage />} />
          <Route path="/staff/activate" element={<StaffActivationPage />} />
          <Route path="/staff" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute allowedRoles={['OPERATIONS_ADMIN', 'SUPER_ADMIN']}>
                <OperationsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations/*"
            element={
              <ProtectedRoute allowedRoles={['OPERATIONS_ADMIN', 'SUPER_ADMIN']}>
                <OperationsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'SUPER_ADMIN']}>
                <WarehouseDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/*"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'SUPER_ADMIN']}>
                <WarehouseDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'SUPER_ADMIN']}>
                <DeliveryAgentPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/*"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'SUPER_ADMIN']}>
                <DeliveryAgentPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'SUPER_ADMIN']}>
                <DeliveryAgentPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/*"
            element={
              <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'SUPER_ADMIN']}>
                <DeliveryAgentPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup"
            element={
              <ProtectedRoute allowedRoles={['PICKUP_STATION_MANAGER', 'SUPER_ADMIN']}>
                <PickupStationPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pickup/*"
            element={
              <ProtectedRoute allowedRoles={['PICKUP_STATION_MANAGER', 'SUPER_ADMIN']}>
                <PickupStationPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER_SUPPORT', 'CUSTOMER_CARE', 'SUPER_ADMIN']}>
                <CustomerSupportPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/*"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER_SUPPORT', 'CUSTOMER_CARE', 'SUPER_ADMIN']}>
                <CustomerSupportPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customercare"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER_SUPPORT', 'CUSTOMER_CARE', 'SUPER_ADMIN']}>
                <CustomerSupportPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customercare/*"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER_SUPPORT', 'CUSTOMER_CARE', 'SUPER_ADMIN']}>
                <CustomerSupportPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation"
            element={
              <ProtectedRoute allowedRoles={['MODERATOR', 'CONTENT_MODERATOR', 'SUPER_ADMIN']}>
                <ModerationPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation/*"
            element={
              <ProtectedRoute allowedRoles={['MODERATOR', 'CONTENT_MODERATOR', 'SUPER_ADMIN']}>
                <ModerationPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute allowedRoles={['CATALOG_ADMIN', 'CATALOG_SPECIALIST', 'MODERATOR', 'SUPER_ADMIN']}>
                <CatalogDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/*"
            element={
              <ProtectedRoute allowedRoles={['CATALOG_ADMIN', 'CATALOG_SPECIALIST', 'MODERATOR', 'SUPER_ADMIN']}>
                <CatalogDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={['FINANCE_ADMIN', 'FINANCE_OFFICER', 'ACCOUNTING_STAFF', 'SUPER_ADMIN']}>
                <FinanceDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/*"
            element={
              <ProtectedRoute allowedRoles={['FINANCE_ADMIN', 'FINANCE_OFFICER', 'ACCOUNTING_STAFF', 'SUPER_ADMIN']}>
                <FinanceDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* LUMO Visual Platform Studio */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <StudioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <StudioPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<ProductListingPage />} />
        </Routes>
      </main>

      {/* Footer (Only displayed on Customer Storefront) */}
      {!isInternalRoute && <Footer />}

      {/* Global Interactive Overlays */}
      <BuyerSellerChatModal />
      <ToastContainer />
      <CompareFloatingBar />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <PlatformConfigProvider>
        <NotificationProvider>
          <CurrencyProvider>
            <RecentlyViewedProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      <OrderProvider>
                        <ChatProvider>
                          <ScrollToTop />
                          <PageLoader />
                          <AppContent />
                        </ChatProvider>
                      </OrderProvider>
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </RecentlyViewedProvider>
          </CurrencyProvider>
        </NotificationProvider>
      </PlatformConfigProvider>
    </Router>
  );
}

export default App;
