import { Navigate, useLocation } from 'react-router-dom';
import { isUserAuthenticated } from '../../features/account/services/userAuth';
import { isAdminAuthenticated } from '../../features/admin/services/adminAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

/** Requires a customer or admin session for checkout and invoices. */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (isUserAuthenticated() || isAdminAuthenticated()) {
    return <>{children}</>;
  }

  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
