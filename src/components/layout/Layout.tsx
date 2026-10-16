import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../../features/cart/components/CartDrawer';

export function Layout() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? 'flex-1' : 'flex-1 pt-20'}>
        <Outlet />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
    </div>
  );
}
