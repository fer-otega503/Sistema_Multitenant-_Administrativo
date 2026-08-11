import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { TokenService } from '../utils/token';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Pantalla Principal DashboardInicio
 * PANTALLA EXCLUSIVA PARA EL ROL DE ADMINISTRADOR / GESTOR.
 * El acceso ya está garantizado por ProtectedRoute en App.jsx.
 * Inyecta datos reales consumidos desde el backend (/api/dashboard/metrics).
 *
 * @param {string} activeSection  Sección activa pasada desde App.jsx vía URL
 */
const DashboardInicio = ({ activeSection: activeSectionProp }) => {
  const navigate  = useNavigate();
  const { tenant } = useParams();

  const sessionUser   = TokenService.getUserSession();
  const tenantId      = tenant || sessionUser?.tenantId || 'ferreteria';

  const [userName,     setUserName]     = useState('Example Gerente');
  const [userRole,     setUserRole]     = useState('ADMINISTRADOR / EJECUTIVO');
  const [businessName, setBusinessName] = useState('Name...');

  const [metricas, setMetricas] = useState({
    ventasDia: '$ 0000.0000',
    ventasMes: '$ 0000.0000',
    inventario: '0000.0000'
  });

  useEffect(() => {
    const activeRole    = sessionUser?.role        || 'Administrador';
    const activeUser    = sessionUser?.name        || 'Example Gerente';
    const activeCompany = sessionUser?.companyName || 'El Martillo Ferretería';

    setUserName(activeUser);
    setBusinessName(activeCompany);

    const normalizedRole = activeRole.toLowerCase();
    if (normalizedRole.includes('gestor')) {
      setUserRole('GESTOR / ADMINISTRADOR');
    } else {
      setUserRole('ADMINISTRADOR / EJECUTIVO');
    }

    // Consumir métricas del backend
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/dashboard/metrics`, {
          headers: { 'x-tenant-id': tenantId }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.exito && data.metricas) {
            setMetricas(data.metricas);
            if (data.nombre_negocio) setBusinessName(data.nombre_negocio);
          }
        }
      } catch {
        // Fallback con datos de ejemplo
        setMetricas({
          ventasDia: '$ 370.0000',
          ventasMes: '$ 1540.0000',
          inventario: '685.0000'
        });
      }
    };

    fetchMetrics();
  }, [tenantId]);

  // ── Mapeo de secciones a sub-rutas ─────────────────────────────────────────
  const sectionToSlug = {
    Inicio:     'dashboard',
    Ventas:     'sells',
    Inventario: 'inventory',
    Empleados:  'employers',
  };

  const handleNavigate = (sectionId) => {
    const slug = sectionToSlug[sectionId] ?? 'dashboard';
    navigate(`/${tenantId}/admin/${slug}`);
  };

  const handleLogout = () => {
    TokenService.clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <DashboardLayout
      nombreNegocio={businessName}
      usuario={userName}
      rol={userRole}
      activeSection={activeSectionProp ?? 'Inicio'}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
};

export default DashboardInicio;
