import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/auth" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
