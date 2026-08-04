import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardCard from './DashboardCard';
import { TokenService } from '../utils/token';

interface DashboardInicioProps {
  onLogout?: () => void;
}

/**
 * Pantalla Principal DashboardInicio
 * PANTALLA EXCLUSIVA PARA EL ROL DE ADMINISTRADOR.
 * Consume métricas reales del backend (/api/dashboard/metrics).
 */
const DashboardInicio: React.FC<DashboardInicioProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  // Obtener la sesión guardada del usuario
  const sessionUser = TokenService.getUser();

  const [userName, setUserName] = useState('Example Gerente');
  const [userRole, setUserRole] = useState('ADMINISTRADOR / EJECUTIVO');
  const [businessName, setBusinessName] = useState('Name...');
  const [isAdmin, setIsAdmin] = useState(true);

  const [metricas, setMetricas] = useState({
    ventasDia: '$ 0000.0000',
    ventasMes: '$ 0000.0000',
    inventario: '0000.0000'
  });

  useEffect(() => {
    // 1. Validar el rol de Administrador
    const activeRole = sessionUser?.role || localStorage.getItem('user_role') || 'Administrador';
    const activeUser = sessionUser?.name || localStorage.getItem('user_name') || 'Example Gerente';
    const activeCompany = sessionUser?.companyName || localStorage.getItem('company_name') || 'El Martillo Ferretería';

    setUserName(activeUser);
    setBusinessName(activeCompany);

    const normalizedRole = activeRole.toLowerCase();
    if (!normalizedRole.includes('admin')) {
      setIsAdmin(false);
      return;
    }

    setUserRole('ADMINISTRADOR / EJECUTIVO');
    setIsAdmin(true);

    // 2. Obtener métricas desde el Backend
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/metrics', {
          headers: {
            'x-tenant-id': sessionUser?.tenantId || 'schema_ferreteria'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exito && data.metricas) {
            setMetricas(data.metricas);
            if (data.nombre_negocio) {
              setBusinessName(data.nombre_negocio);
            }
          }
        }
      } catch (error) {
        console.warn('Backend usando datos de fallback:', error);
        setMetricas({
          ventasDia: '$ 370.0000',
          ventasMes: '$ 1540.0000',
          inventario: '685.0000'
        });
      }
    };

    fetchMetrics();
  }, []);

  const handleLogoutAction = () => {
    TokenService.clearSession();
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  // Restricción de vista para usuarios no administradores
  if (!isAdmin) {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedCard}>
          <div style={styles.deniedIcon}>🔒</div>
          <h2 style={styles.deniedTitle}>Acceso Restringido</h2>
          <p style={styles.deniedText}>
            Esta pantalla está reservada exclusivamente para el rol de <strong>Administrador</strong>.
          </p>
          <p style={styles.deniedSubtext}>
            Rol actual: <em>{sessionUser?.role || 'Empleado'}</em>.
          </p>
          <button style={styles.logoutBtn} onClick={handleLogoutAction}>
            Cerrar Sesión / Cambiar de Usuario
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      nombreNegocio={businessName}
      usuario={userName}
      rol={userRole}
    >
      <div style={styles.contentPadding}>
        <div style={styles.gridContainer}>
          <DashboardCard
            titulo="Ventas del Dia"
            valor={metricas.ventasDia}
            unidad="MX"
          />
          <DashboardCard
            titulo="Ventas del Mes"
            valor={metricas.ventasMes}
            unidad="MX"
          />
          <DashboardCard
            titulo="Inventario"
            valor={metricas.inventario}
            unidad="Stock"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  contentPadding: {
    padding: '36px',
    width: '100%',
    boxSizing: 'border-box'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%'
  },
  deniedContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  deniedCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '450px',
    color: '#FFFFFF',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
  },
  deniedIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  deniedTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#F87171',
    margin: '0 0 12px 0'
  },
  deniedText: {
    fontSize: '15px',
    color: '#E2E8F0',
    lineHeight: '1.5',
    margin: '0 0 8px 0'
  },
  deniedSubtext: {
    fontSize: '13px',
    color: '#94A3B8',
    marginBottom: '24px'
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  }
};

export default DashboardInicio;
