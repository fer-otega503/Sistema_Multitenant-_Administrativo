import { useNavigate } from 'react-router-dom';
import { TokenService } from '../utils/token';

/**
 * useAuthRedirect
 *
 * Hook que, después de un login exitoso, construye la URL semántica
 * correspondiente al rol del usuario y navega a ella.
 *
 * Rutas:
 *   - Admin/Gestor  → /:tenant/admin/dashboard
 *   - Empleado/etc. → /:tenant/employee/:id/dashboard
 */
export function useAuthRedirect() {
  const navigate = useNavigate();

  const redirectAfterLogin = () => {
    const session = TokenService.getUserSession();

    console.group('[useAuthRedirect] redirectAfterLogin');
    console.log('session:', session);

    if (!session) {
      console.warn('Sin sesión guardada — no se puede redirigir');
      console.groupEnd();
      return;
    }

    const { tenantId, role, id } = session;
    const roleLower = (role ?? '').toLowerCase();

    console.log(`tenantId="${tenantId}" role="${role}" roleLower="${roleLower}" id="${id}"`);

    if (roleLower === 'administrador' || roleLower === 'admin' || roleLower === 'gestor') {
      // Admin: /ferreteria/admin/dashboard
      const url = `/${tenantId}/admin/dashboard`;
      console.log('→ Admin URL:', url);
      console.groupEnd();
      navigate(url, { replace: true });
    } else {
      // Empleado: /ferreteria/employee/6/dashboard
      // Segmentos separados para garantizar el parsing de React Router
      const url = `/${tenantId}/employee/${id}/dashboard`;
      console.log('→ Empleado URL:', url);
      console.groupEnd();
      navigate(url, { replace: true });
    }
  };

  return { redirectAfterLogin };
}
