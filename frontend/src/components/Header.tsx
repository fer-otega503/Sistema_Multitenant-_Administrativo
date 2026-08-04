import React from 'react';

interface HeaderProps {
  nombreNegocio?: string;
  usuario?: string;
  rol?: string;
}

/**
 * Componente Header
 * Muestra la fecha actual, el título del negocio activo e información del usuario autenticado.
 */
const Header: React.FC<HeaderProps> = ({ 
  nombreNegocio = 'Name...', 
  usuario = 'Example Gerente', 
  rol = 'ADMINISTRADOR / EJECUTIVO' 
}) => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  return (
    <header style={styles.headerContainer}>
      <div style={styles.leftSection}>
        <div style={styles.fechaLabel}>
          FECHA: <span style={styles.fechaValue}>{fechaFormateada}</span>
        </div>
        <h1 style={styles.tituloNegocio}>
          Negocio “<span style={styles.nombreDinamico}>{nombreNegocio}</span>”
        </h1>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.userTextContainer}>
          <div style={styles.userName}>{usuario}</div>
          <div style={styles.userRole}>{rol}</div>
        </div>
        
        <div style={styles.avatarCircle}>
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  headerContainer: {
    backgroundColor: '#FFFFFF',
    padding: '24px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid #E5E7EB'
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fechaLabel: {
    fontSize: '13px',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: '1px'
  },
  fechaValue: {
    color: '#374151'
  },
  tituloNegocio: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  nombreDinamico: {
    fontWeight: '400'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userTextContainer: {
    textAlign: 'right'
  },
  userName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  userRole: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: '0.5px',
    marginTop: '2px',
    textTransform: 'uppercase'
  },
  avatarCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }
};

export default Header;
