import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import { authAPI } from '../../api/client.js';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, logout } = useAuthStore();
  const [verified, setVerified] = useState(null); // null=kontrol ediliyor, true=geçerli, false=geçersiz

  useEffect(() => {
    if (!token) { setVerified(false); return; }
    authAPI.me()
      .then(() => setVerified(true))
      .catch(() => { logout(); setVerified(false); });
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;
  if (verified === null) return null; // sessizce bekle, flash olmaz
  if (!verified) return <Navigate to="/auth" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
