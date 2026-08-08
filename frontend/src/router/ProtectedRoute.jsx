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
 */
const ProtectedRoute = ({ requiredType, children }) => {
  const params = useParams();

  // ── 1. Verificar que exista sesión ─────────────────────────────────────────
  const session = TokenService.getUserSession();
  const token   = TokenService.getToken();

  if (!session || !token) {
    console.warn('[ProtectedRoute] Sin sesión → /login');
    return <Navigate to="/login" replace />;
  }

  // ── 2. Verificar que el tenant de la URL coincida con el de la sesión ──────
  const urlTenant     = params.tenant;
  const sessionTenant = session.tenantId;

  if (urlTenant && sessionTenant && urlTenant !== sessionTenant) {
    console.warn(`[ProtectedRoute] Tenant mismatch: URL="${urlTenant}" sesión="${sessionTenant}" → /login`);
    TokenService.clearSession();
    return <Navigate to="/login" replace />;
  }

  // ── 3. Verificar el tipo de ruta vs rol de sesión ──────────────────────────
  const role = (session.role ?? '').toLowerCase();

  // Roles de administración (pueden acceder a rutas /admin/*)
  const isAdminRole = role === 'administrador' || role === 'admin' || role === 'gestor';
  // Cualquier otro rol es empleado (Empleado, Gerente, Limpieza, etc.)
  const isEmployeeRole = !isAdminRole;

  console.info(`[ProtectedRoute] rol="${role}" requiredType="${requiredType}" isAdmin=${isAdminRole} isEmployee=${isEmployeeRole}`);

  if (requiredType === 'admin' && !isAdminRole) {
    console.warn('[ProtectedRoute] Acceso admin denegado para rol empleado → /login');
    return <Navigate to="/login" replace />;
  }

  if (requiredType === 'employee' && !isEmployeeRole) {
    console.warn('[ProtectedRoute] Acceso employee denegado para rol admin → /login');
    return <Navigate to="/login" replace />;
  }

  // ── 4. Para rutas de empleado: verificar que el ID coincida ─────────────────
  if (requiredType === 'employee') {
    const urlEmpId     = params.empId;
    // Normalizar ambos a string sin espacios para comparación robusta
    const sessionEmpId = String(session.id ?? '').trim();

    console.info(`[ProtectedRoute] empId URL="${urlEmpId}" sesión="${sessionEmpId}"`);

    // Solo bloquear si AMBOS existen y son distintos (evita falsos negativos con vacíos)
    if (urlEmpId && sessionEmpId && urlEmpId.trim() !== sessionEmpId) {
      console.warn(`[ProtectedRoute] ID mismatch: URL="${urlEmpId}" sesión="${sessionEmpId}" → /login`);
      return <Navigate to="/login" replace />;
    }
  }

  // ── Todo correcto → renderizar ───────────────────────────────────────────────
  return children;
};

export default ProtectedRoute;
