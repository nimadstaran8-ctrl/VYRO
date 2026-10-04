import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../../features/admin/services/adminAuth';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Client-side gate for admin pages. This only hides the UI — it is not a
 * security boundary (see src/features/admin/services/adminAuth.ts).
 */
export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
