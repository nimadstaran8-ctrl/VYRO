import { Navigate, useLocation } from 'react-router-dom';
import { isUserAuthenticated } from '../../features/account/services/userAuth';
import { isAdminAuthenticated } from '../../features/admin/services/adminAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Client-side gate for storefront pages. Visitors must register and sign in
 * before they can browse. The store owner is exempt: once signed into the
 * admin panel (same browser session/tab), the gate lets them through so
 * browsing their own store never asks them to register.
 *
 * UI-level only — not a security boundary (see userAuth.ts / adminAuth.ts).
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (isUserAuthenticated() || isAdminAuthenticated()) {
    return <>{children}</>;
  }

  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
