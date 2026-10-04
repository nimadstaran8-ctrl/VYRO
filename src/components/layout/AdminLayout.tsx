import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { logoutAdmin, getAdminSession } from '../../features/admin/services/adminAuth';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Image,
  Home,
  Settings,
  ScrollText,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ExternalLink,
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
  { path: ROUTES.ADMIN_USERS, labelKey: 'adminNav.users', icon: <Users className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_MEDIA, labelKey: 'adminNav.media', icon: <Image className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_HOMEPAGE, labelKey: 'adminNav.homepage', icon: <Home className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_SETTINGS, labelKey: 'adminNav.settings', icon: <Settings className="h-5 w-5" /> },
  { path: ROUTES.ADMIN_LOGS, labelKey: 'adminNav.logs', icon: <ScrollText className="h-5 w-5" /> },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getAdminSession();

  const isActive = (path: string) => {
    if (path === ROUTES.ADMIN) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const currentNavItem = navItems.find(
    (item) => item.path !== ROUTES.ADMIN && location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 start-0 z-50 flex h-full w-64 flex-col bg-surface border-e border-border transform transition-transform duration-200 lg:translate-x-0 rtl:lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 rtl:translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
        aria-label={language === 'fa' ? 'منوی مدیریت' : 'Admin navigation'}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            to={ROUTES.ADMIN}
            className="flex items-center gap-2"
            onClick={closeSidebar}
          >
            <span className="text-xl font-bold text-primary">VYRO</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-text-secondary">
              {language === 'fa' ? 'مدیریت' : 'Admin'}
            </span>
          </Link>
          <button
            onClick={closeSidebar}
            className="rounded-lg p-1 text-text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            aria-label={language === 'fa' ? 'بستن منو' : 'Close menu'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              aria-current={isActive(item.path) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
        <div className="shrink-0 space-y-1 border-t border-border p-4">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="h-5 w-5" />
            <span>{language === 'fa' ? 'مشاهده فروشگاه' : 'View Storefront'}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut className="h-5 w-5 rtl:rotate-180" />
            <span>{language === 'fa' ? 'خروج از حساب' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ps-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
              aria-label={language === 'fa' ? 'باز کردن منو' : 'Open menu'}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Link to={ROUTES.ADMIN} className="hover:text-primary">
                {t('adminNav.dashboard', language)}
              </Link>
              {currentNavItem && location.pathname !== ROUTES.ADMIN && (
                <>
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  <span className="text-primary">{t(currentNavItem.labelKey, language)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {session?.username || (language === 'fa' ? 'مدیر' : 'Admin')}
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
