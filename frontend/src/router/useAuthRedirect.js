import { useNavigate } from 'react-router-dom';
import { TokenService } from '../utils/token';

/**
 * useAuthRedirect
 *
 * Hook que, después de un login exitoso, construye la URL semántica
 * correspondiente al rol del usuario y navega a ella.
 *
 * Reglas de routing:
 *   - Administrador / Gestor → /:tenant/admin/dashboard
 *   - Empleado / Gerente / Limpieza → /:tenant/employee-:id/dashboard
 */
export function useAuthRedirect() {
  const navigate = useNavigate();

  /**
   * Navega a la URL correcta según la sesión guardada.
   * Debe llamarse después de que TokenService.saveSession() haya sido ejecutado.
   */
  const redirectAfterLogin = () => {
    const session = TokenService.getUserSession();
    if (!session) return;

    const { tenantId, role, id } = session;
    const roleLower = (role ?? '').toLowerCase();

    if (roleLower === 'administrador' || roleLower === 'admin' || roleLower === 'gestor') {
      navigate(`/${tenantId}/admin/dashboard`, { replace: true });
    } else {
      navigate(`/${tenantId}/employee-${id}/dashboard`, { replace: true });
    }
  };

  return { redirectAfterLogin };
}
