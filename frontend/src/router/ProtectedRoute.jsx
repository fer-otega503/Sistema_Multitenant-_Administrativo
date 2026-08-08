import { Navigate, useParams } from 'react-router-dom';
import { TokenService } from '../utils/token';

/**
 * ProtectedRoute
 *
 * Valida en capas antes de renderizar cualquier ruta protegida:
 *   1. Que exista sesión activa (token + user en localStorage)
 *   2. Que el :tenant de la URL coincida con el tenantId de la sesión
 *   3. Que el rol del usuario sea compatible con el tipo de ruta (admin / employee)
 *   4. Para rutas de empleado: que el :empId de la URL coincida con el id de la sesión
 *
 * Si alguna validación falla → redirige a /login sin dejar historial.
 *
 * @param {'admin'|'employee'} requiredType  Tipo de acceso requerido por la ruta
 * @param {React.ReactNode}    children       Componente a renderizar si pasa los guards
 */
const ProtectedRoute = ({ requiredType, children }) => {
  const params = useParams();

  // ── 1. Verificar que exista sesión ─────────────────────────────────────────
  const session = TokenService.getUserSession();
  const token   = TokenService.getToken();

  if (!session || !token) {
    return <Navigate to="/login" replace />;
  }

  // ── 2. Verificar que el tenant de la URL coincida con el de la sesión ──────
  const urlTenant     = params.tenant;
  const sessionTenant = session.tenantId;

  if (urlTenant && sessionTenant && urlTenant !== sessionTenant) {
    // Tenant manipulado — forzar logout
    TokenService.clearSession();
    return <Navigate to="/login" replace />;
  }

  // ── 3. Verificar el tipo de ruta vs rol de sesión ──────────────────────────
  const role = session.role?.toLowerCase() ?? '';
  const isAdminRole    = role === 'administrador' || role === 'admin' || role === 'gestor';
  const isEmployeeRole = !isAdminRole; // Empleado, Gerente, Limpieza, etc.

  if (requiredType === 'admin' && !isAdminRole) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType === 'employee' && !isEmployeeRole) {
    // Un admin no puede acceder a rutas de empleado por la URL
    return <Navigate to="/login" replace />;
  }

  // ── 4. Para rutas de empleado: verificar que el ID coincida ─────────────────
  if (requiredType === 'employee') {
    const urlEmpId     = params.empId;
    const sessionEmpId = String(session.id ?? '');

    if (urlEmpId && sessionEmpId && urlEmpId !== sessionEmpId) {
      // Un empleado intentó acceder al dashboard de otro empleado
      return <Navigate to="/login" replace />;
    }
  }

  // ── Todo correcto → renderizar ───────────────────────────────────────────────
  return children;
};

export default ProtectedRoute;
