import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenService } from '../utils/token';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DARK_SIDEBAR = '#111827';
const FONT         = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL: DASHBOARD EMPLEADO
// ════════════════════════════════════════════════════════════════════════════
const EmpleadoDashboard = ({ onLogout, activeSection: activeSectionProp }) => {
  const navigate  = useNavigate();
  const session   = TokenService.getUserSession();
  const tenantId  = session?.tenantId || 'ferreteria';
  const empId     = session?.id       || '';

  const userName    = session?.name        || 'Empleado';
  const userRole    = session?.role        || 'Empleado';
  const companyName = session?.companyName || 'El Martillo Ferretera';

  // La sección activa la dicta la URL, no el estado local
  const activeSection = activeSectionProp ?? 'Inicio';

  // Mapa de secciones a slugs de URL
  const sectionToSlug = {
    Inicio:     'dashboard',
    Ventas:     'sells',
    Inventario: 'inventory',
  };

  const handleNavigate = (sectionId) => {
    const slug = sectionToSlug[sectionId] ?? 'dashboard';
    navigate(`/${tenantId}/employee/${empId}/${slug}`);
  };

  const handleLogout = () => {
    TokenService.clearSession();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login', { replace: true });
    }
  };

  // ── Secciones disponibles para empleados (sin Empleados ni admin tools) ───
  const menuItems = [
    {
      id: 'Inicio',
      label: 'Inicio',
      icon: (color) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
  ];

  return (
    <div style={styles.layoutContainer}>

      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside style={styles.sidebar}>

        {/* Logo */}
        <div style={styles.logoContainer}>
          <img
            src="/Logos/martillo.png"
            alt="El Martillo Ferretería"
            style={styles.logoImage}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={styles.logoFallback}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span style={styles.logoFallbackText}>EL MARTILLO</span>
            <span style={styles.logoFallbackSubtext}>FERRETERÍA</span>
          </div>
        </div>

        {/* Perfil del empleado */}
        <div style={styles.employeeProfile}>
          <div style={styles.avatarCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{userName}</div>
            <div style={styles.profileRole}>{userRole.toUpperCase()}</div>
          </div>
        </div>

        {/* Separador */}
        <div style={styles.sectionLabel}>Menú Principal</div>

        {/* Navegación */}
        <nav style={styles.navContainer}>
          {menuItems.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => handleNavigate(item.id)}
            />
          ))}
        </nav>

        {/* Cerrar Sesión */}
        <div style={styles.logoutContainer}>
          <LogoutBtn onClick={handleLogout} />
        </div>
      </aside>

      {/* ─── Área de Contenido ──────────────────────────────────────── */}
      <div style={styles.contentArea}>
        {/* Header */}
        <EmpHeader
          companyName={companyName}
          userName={userName}
          role={userRole}
        />

        {/* Contenido de la sección */}
        <main style={styles.mainBody}>
          {activeSection === 'Inicio' && <InicioEmpleado tenantId={tenantId} userName={userName} userRole={userRole} empId={empId} onNavigate={handleNavigate} />}
        </main>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SECCIÓN: INICIO DEL EMPLEADO  (bienvenida + accesos rápidos funcionales)
// ════════════════════════════════════════════════════════════════════════════
const InicioEmpleado = ({ tenantId, userName, userRole, onNavigate }) => {
  const [metricas, setMetricas] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/dashboard/metrics', {
          headers: { 'x-tenant-id': tenantId }
        });
        if (res.ok) {
          const d = await res.json();
          if (d.exito && d.metricas) setMetricas(d.metricas);
        }
      } catch { /* offline */ }
    };
    fetch_();
  }, [tenantId]);

  const hoy    = new Date();
  const hora   = hoy.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ padding: '32px 36px', fontFamily: FONT }}>

      {/* ─── Banner ──────────────────────────────────────────────────── */}
      <div style={welcomeStyles.banner}>
        <div style={welcomeStyles.bannerLeft}>
          <div style={welcomeStyles.bannerEmoji}>🔨</div>
          <div>
            <div style={welcomeStyles.bannerTitle}>
              {saludo}, <span style={{ color: '#60A5FA' }}>{userName}</span>
            </div>
            <div style={welcomeStyles.bannerSub}>
              Bienvenido al sistema de gestión — <strong>El Martillo Ferretería</strong>
            </div>
          </div>
        </div>
        <div style={welcomeStyles.bannerRight}>
          <div style={welcomeStyles.dateBox}>
            <span style={welcomeStyles.dateLabel}>HOY</span>
            <span style={welcomeStyles.dateValue}>
              {hoy.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Tarjeta del rol ─────────────────────────────────────────── */}
      <div style={welcomeStyles.roleCard}>
        <div style={welcomeStyles.roleIconBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <div style={welcomeStyles.roleTitle}>
            Tu Rol — <span style={{ color: '#1D4ED8' }}>{userRole}</span>
          </div>
          <div style={welcomeStyles.roleDesc}>
            Tienes acceso a la consulta de ventas y al inventario de productos.
            Puedes buscar, filtrar y consultar información, pero la gestión de usuarios
            y la configuración del sistema están reservadas para el Administrador.
          </div>
        </div>
      </div>

      {/* ─── Métricas del día (solo lectura) ─────────────────────────── */}
      {metricas && (
        <div style={welcomeStyles.cardsGrid}>
          <MetricCard title="Ventas del Día"      value={metricas.ventasDia}  icon="📊" accent="#2563EB" />
          <MetricCard title="Ventas del Mes"      value={metricas.ventasMes}  icon="📈" accent="#059669" />
          <MetricCard title="Stock en Inventario" value={metricas.inventario} icon="📦" accent="#D97706" />
        </div>
      )}

    </div>
  );
};

// Pequeña tarjeta de métrica
const MetricCard = ({ title, value, icon, accent }) => (
  <div style={{
    backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '20px 22px',
    border: `1px solid #E5E7EB`, borderLeft: `4px solid ${accent}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontFamily: FONT,
    display: 'flex', alignItems: 'center', gap: '16px',
  }}>
    <div style={{ fontSize: '28px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', fontFamily: '"Courier New",Courier,monospace' }}>
        {value}
      </div>
    </div>
  </div>
);

// Tarjeta de acceso rápido CON botón funcional
const QuickAccessCard = ({ icon, title, desc, btnLabel, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '18px 18px 14px',
      border: '1px solid #E5E7EB', fontFamily: FONT,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', flex: 1 }}>{desc}</div>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          marginTop: '6px', padding: '8px 16px', borderRadius: '6px', border: 'none',
          backgroundColor: hovered ? '#1D4ED8' : '#2563EB',
          color: '#FFFFFF', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {btnLabel}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SECCIÓN: VENTAS (solo consulta)  — importa y reutiliza Ventas.jsx
// ════════════════════════════════════════════════════════════════════════════
import Ventas from './Ventas';
const VentasView = ({ tenantId }) => <Ventas />;

// ════════════════════════════════════════════════════════════════════════════
//  SECCIÓN: INVENTARIO (solo consulta — sin botones de Agregar/Eliminar)
// ════════════════════════════════════════════════════════════════════════════
const InventarioView = ({ tenantId }) => {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [productos,      setProductos]      = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [apiError,       setApiError]       = useState(null);

  const fetchProductos = async (codigo = '') => {
    setIsLoading(true);
    setApiError(null);
    try {
      const url = codigo.trim()
        ? `http://localhost:3000/api/inventario/productos?codigo=${encodeURIComponent(codigo.trim())}`
        : `http://localhost:3000/api/inventario/productos`;
      const res = await fetch(url, { headers: { 'X-Tenant-ID': tenantId } });
      if (!res.ok) { setApiError('Error al cargar el inventario.'); return; }
      const data = await res.json();
      if (data.exito) setProductos(data.productos);
    } catch {
      setApiError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  return (
    <div style={{ padding: '28px 32px', fontFamily: FONT }}>
      {/* Barra */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          type="text" placeholder="Código"
          value={codigoBusqueda}
          onChange={e => setCodigoBusqueda(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchProductos(codigoBusqueda)}
          style={{
            border: '1.5px solid #D1D5DB', borderRadius: '6px', padding: '8px 14px',
            fontSize: '14px', color: '#374151', backgroundColor: '#FFFFFF', outline: 'none',
            width: '160px', fontFamily: FONT,
          }}
        />
        <button
          onClick={() => fetchProductos(codigoBusqueda)}
          style={{
            border: '1.5px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF',
            color: '#374151', padding: '8px 20px', fontSize: '14px', fontWeight: '500',
            cursor: 'pointer', fontFamily: FONT,
          }}
        >
          Consultar
        </button>
        <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '8px', fontStyle: 'italic' }}>
          🔒 Solo lectura — Contacta al administrador para modificar el inventario.
        </span>
      </div>

      {/* Error */}
      {apiError && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: '#DC2626' }}>
          {apiError}
        </div>
      )}

      {/* Tabla */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Código', 'Descripción', 'Costo', 'Precio Venta', 'Unidad', 'Existencias'].map(col => (
                <th key={col} style={{
                  backgroundColor: '#111634', color: '#FFFFFF', padding: '12px 16px',
                  textAlign: col === 'Código' || col === 'Descripción' ? 'left' : 'right',
                  fontWeight: '600', fontSize: '13px', fontFamily: FONT,
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF', fontFamily: '"Courier New",Courier,monospace' }}>
                Cargando inventario...
              </td></tr>
            )}
            {!isLoading && productos.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#D1D5DB', fontFamily: '"Courier New",Courier,monospace' }}>
                Sin productos encontrados
              </td></tr>
            )}
            {!isLoading && productos.map((p, i) => (
              <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                <td style={{ padding: '11px 16px', color: '#1F2937', fontFamily: '"Courier New",Courier,monospace', fontWeight: '600', borderBottom: '1px solid #F3F4F6' }}>{p.codigo}</td>
                <td style={{ padding: '11px 16px', color: '#1F2937', borderBottom: '1px solid #F3F4F6' }}>{p.nombre}</td>
                <td style={{ padding: '11px 16px', color: '#1F2937', textAlign: 'right', fontFamily: '"Courier New",Courier,monospace', borderBottom: '1px solid #F3F4F6' }}>${Number(p.costo).toFixed(2)}</td>
                <td style={{ padding: '11px 16px', color: '#1F2937', textAlign: 'right', fontFamily: '"Courier New",Courier,monospace', borderBottom: '1px solid #F3F4F6' }}>${Number(p.precio_venta).toFixed(2)}</td>
                <td style={{ padding: '11px 16px', color: '#1F2937', textAlign: 'right', borderBottom: '1px solid #F3F4F6' }}>{p.unidad}</td>
                <td style={{ padding: '11px 16px', color: '#1F2937', textAlign: 'right', fontFamily: '"Courier New",Courier,monospace', borderBottom: '1px solid #F3F4F6' }}>{Number(p.stock).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTES DE LAYOUT
// ════════════════════════════════════════════════════════════════════════════

// Header del empleado
const EmpHeader = ({ companyName, userName, role }) => {
  const hoy = new Date();
  const fecha = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`;

  return (
    <header style={{
      backgroundColor: '#FFFFFF', padding: '20px 36px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderBottom: '1px solid #E5E7EB', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '12px', fontFamily: '"Courier New",Courier,monospace', fontWeight: '700', color: '#6B7280', letterSpacing: '1px' }}>
          FECHA: <span style={{ color: '#374151' }}>{fecha}</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827', fontFamily: FONT }}>
          Negocio "<span style={{ fontWeight: '400' }}>{companyName}</span>"
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: FONT }}>{userName}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '2px' }}>
            {role}
          </div>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
    </header>
  );
};

// Ítem del sidebar
const SidebarItem = ({ item, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const color = isActive ? '#2563EB' : hovered ? '#F9FAFB' : '#9CA3AF';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 16px', borderRadius: '6px', cursor: 'pointer',
        marginBottom: '2px', transition: 'all 0.2s ease',
        backgroundColor: isActive ? '#E5E7EB' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color, fontWeight: isActive ? '700' : '500',
        fontSize: '14px', fontFamily: FONT,
      }}
    >
      {item.icon(color)}
      <span>{item.label}</span>
    </div>
  );
};

// Botón de logout del sidebar
const LogoutBtn = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 14px', borderRadius: '6px', border: 'none',
        backgroundColor: hovered ? 'rgba(239,68,68,0.15)' : 'transparent',
        color: hovered ? '#FCA5A5' : '#6B7280',
        cursor: 'pointer', fontSize: '14px', fontWeight: '500',
        fontFamily: FONT, transition: 'all 0.2s ease', textAlign: 'left',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Cerrar Sesión
    </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  ESTILOS
// ════════════════════════════════════════════════════════════════════════════
const styles = {
  layoutContainer: {
    display: 'flex', width: '100vw', height: '100vh',
    overflow: 'hidden', backgroundColor: '#F3F4F6',
  },
  sidebar: {
    width: '250px', height: '100vh', backgroundColor: DARK_SIDEBAR,
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF', padding: '10px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '110px', borderBottom: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  logoImage: {
    width: '100%', maxWidth: '200px', height: '90px',
    objectFit: 'contain', objectPosition: 'center', display: 'block',
  },
  logoFallback: {
    display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  logoFallbackText: {
    fontWeight: '800', fontSize: '14px', color: '#1E3A8A', marginTop: '6px', fontFamily: 'sans-serif',
  },
  logoFallbackSubtext: {
    fontSize: '9px', letterSpacing: '2px', color: '#3B82F6', fontWeight: '600',
  },
  employeeProfile: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  avatarCircle: {
    width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#374151',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  profileInfo: { overflow: 'hidden' },
  profileName: {
    fontSize: '14px', fontWeight: '700', color: '#F9FAFB', fontFamily: FONT,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '10px', fontWeight: '600', color: '#6B7280', letterSpacing: '0.5px',
    fontFamily: FONT, marginTop: '2px',
  },
  sectionLabel: {
    color: '#4B5563', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px',
    padding: '16px 20px 8px', fontFamily: FONT,
  },
  navContainer: {
    padding: '0 10px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto',
  },
  logoutContainer: {
    padding: '10px 14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
  },
  contentArea: {
    flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
  },
  mainBody: { flex: 1 },
};

const welcomeStyles = {
  banner: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #111634 100%)',
    borderRadius: '12px', padding: '28px 32px', marginBottom: '24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '16px',
    boxShadow: '0 4px 20px rgba(17,22,52,0.3)',
  },
  bannerLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  bannerEmoji: { fontSize: '48px', lineHeight: 1 },
  bannerTitle: {
    fontSize: '24px', fontWeight: '700', color: '#FFFFFF', fontFamily: FONT, marginBottom: '6px',
  },
  bannerSub: { fontSize: '14px', color: '#93C5FD', fontFamily: FONT },
  bannerRight: {},
  dateBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    padding: '12px 18px', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
  },
  dateLabel: { fontSize: '10px', fontWeight: '700', color: '#60A5FA', letterSpacing: '1px' },
  dateValue: { fontSize: '13px', color: '#E2E8F0', fontFamily: FONT, marginTop: '4px', textTransform: 'capitalize' },
  roleCard: {
    backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px',
    padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: '16px',
    marginBottom: '24px', fontFamily: FONT,
  },
  roleIconBox: {
    width: '46px', height: '46px', borderRadius: '10px',
    backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  roleTitle: { fontSize: '14px', fontWeight: '700', color: '#1D4ED8', marginBottom: '6px' },
  roleDesc: { fontSize: '13px', color: '#374151', lineHeight: '1.6' },
  cardsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px',
  },
  tipsSection: { fontFamily: FONT },
  tipsTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '14px' },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
};

export default EmpleadoDashboard;
