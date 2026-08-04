import React, { useState } from 'react';
import Header from './Header';
import Inicio from './Inicio';

interface MenuItemType {
  id: string;
  label: string;
  icon: (color: string) => React.ReactNode;
}

interface DashboardLayoutProps {
  children?: React.ReactNode;
  nombreNegocio?: string;
  usuario?: string;
  rol?: string;
}

/**
 * Layout Principal (DashboardLayout)
 * Estructura de 100vh de alto con Sidebar lateral a la izquierda y área de contenido a la derecha.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  nombreNegocio = 'Name...', 
  usuario = 'Example Gerente', 
  rol = 'ADMINISTRADOR / EJECUTIVO' 
}) => {
  const [activeItem, setActiveItem] = useState('Inicio');

  const menuItems: MenuItemType[] = [
    {
      id: 'Inicio',
      label: 'Inicio',
      icon: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: 'Ventas',
      label: 'Ventas',
      icon: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      )
    },
    {
      id: 'Inventario',
      label: 'Inventario',
      icon: (color: string) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.29 7 12 12 20.71 7"/>
          <line x1="12" y1="22" x2="12" y2="12"/>
        </svg>
      )
    }
  ];

  return (
    <div style={styles.layoutContainer}>
      {/* Sidebar Lateral */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img 
            src="/Logos/martillo.png" 
            alt="El Martillo Ferretería" 
            style={styles.logoImage}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.nextSibling) {
                (target.nextSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div style={styles.logoFallback}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span style={styles.logoFallbackText}>EL MARTILLO</span>
            <span style={styles.logoFallbackSubtext}>FERRETERÍA</span>
          </div>
        </div>

        <div style={styles.menuHeaderTitle}>Menú Principal</div>

        <nav style={styles.navContainer}>
          {menuItems.map((item) => (
            <MenuItem 
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Área de Contenido Principal */}
      <div style={styles.contentArea}>
        <Header 
          nombreNegocio={nombreNegocio} 
          usuario={usuario} 
          rol={rol} 
        />

        <main style={styles.mainBody}>
          {children || <Inicio />}
        </main>
      </div>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItemType;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.25s ease',
    backgroundColor: isActive 
      ? '#E5E7EB' 
      : isHovered 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'transparent',
    color: isActive 
      ? '#2563EB' 
      : isHovered 
        ? '#F9FAFB' 
        : '#9CA3AF',
    fontWeight: isActive ? '700' : '500',
    fontSize: '15px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const iconColor = isActive 
    ? '#2563EB' 
    : isHovered 
      ? '#F9FAFB' 
      : '#9CA3AF';

  return (
    <div 
      style={itemStyle} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.icon(iconColor)}
      <span>{item.label}</span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6'
  },
  sidebar: {
    width: '260px',
    height: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    boxSizing: 'border-box'
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '140px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '120px',
    objectFit: 'contain'
  },
  logoFallback: {
    display: 'none',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoFallbackText: {
    fontWeight: '800',
    fontSize: '15px',
    color: '#1E3A8A',
    marginTop: '6px',
    fontFamily: 'sans-serif'
  },
  logoFallbackSubtext: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#3B82F6',
    fontWeight: '600'
  },
  menuHeaderTitle: {
    color: '#4B5563',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    padding: '24px 20px 12px 20px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  navContainer: {
    padding: '0 12px',
    display: 'flex',
    flexDirection: 'column'
  },
  contentArea: {
    flex: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#F3F4F6'
  },
  mainBody: {
    flex: 1
  }
};

export default DashboardLayout;
