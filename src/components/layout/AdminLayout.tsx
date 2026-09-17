import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Image,
  Home,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: ROUTES.ADMIN, labelKey: 'adminNav.dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_PRODUCTS, labelKey: 'adminNav.products', icon: <Package className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_CATEGORIES, labelKey: 'adminNav.categories', icon: <FolderTree className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_ORDERS, labelKey: 'adminNav.orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_CUSTOMERS, labelKey: 'adminNav.customers', icon: <Users className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_MEDIA, labelKey: 'adminNav.media', icon: <Image className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_HOMEPAGE, labelKey: 'adminNav.homepage', icon: <Home className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_SETTINGS, labelKey: 'adminNav.settings', icon: <Settings className="h-5 w-5" /> },
];

export function AdminLayout() {
  const location = useLocation();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === ROUTES.ADMIN) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 h-full w-64 bg-surface border-e border-border transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link
            to={ROUTES.ADMIN}
            className="flex items-center gap-2"
            onClick={closeSidebar}
          >
            <span className="text-xl font-bold text-primary">VYRO</span>
            <span className="text-xs font-medium text-text-secondary bg-primary/10 px-2 py-0.5 rounded">
              {language === 'fa' ? 'مدیریت' : 'Admin'}
            </span>
          </Link>
          <button
            onClick={closeSidebar}
            className="p-1 text-text-secondary hover:text-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-background'
              )}
            >
              {item.icon}
              <span>{t(item.labelKey, language)}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 start-0 end-0 p-4 border-t border-border">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-background transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{language === 'fa' ? 'بازگشت به فروشگاه' : 'Back to Store'}</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ps-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-secondary hover:text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to={ROUTES.ADMIN} className="hover:text-primary">
              {t('adminNav.dashboard', language)}
            </Link>
            {location.pathname !== ROUTES.ADMIN && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-primary">
                  {navItems.find(item => location.pathname.startsWith(item.path) && item.path !== ROUTES.ADMIN)
                    ? t(navItems.find(item => location.pathname.startsWith(item.path) && item.path !== ROUTES.ADMIN)!.labelKey, language)
                    : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {language === 'fa' ? 'مدیر' : 'Admin'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
