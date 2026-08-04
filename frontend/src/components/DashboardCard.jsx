import React, { useState } from 'react';

/**
 * Componente Tarjeta del Dashboard (DashboardCard)
 * Fondo blanco por defecto, con bordes redondeados y sombra sutil.
 * Animación Hover: Transición suave (duration-300) a gris oscuro/azulado (#4B5563) con todo el texto en blanco.
 */
const DashboardCard = ({ titulo, valor, unidad, subtitulo }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    backgroundColor: isHovered ? '#4B5563' : '#FFFFFF',
    color: isHovered ? '#FFFFFF' : '#111827',
    padding: '32px 24px',
    borderRadius: '12px',
    boxShadow: isHovered 
      ? '0 12px 24px -6px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(0, 0, 0, 0.15)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid',
    borderColor: isHovered ? '#4B5563' : '#E5E7EB',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    userSelect: 'none'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: isHovered ? '#FFFFFF' : '#374151',
    transition: 'color 0.3s ease'
  };

  const valueStyle = {
    fontSize: '34px',
    fontWeight: '700',
    fontFamily: '"Courier New", Courier, monospace',
    letterSpacing: '1px',
    color: isHovered ? '#FFFFFF' : '#111827',
    marginBottom: '8px',
    transition: 'color 0.3s ease'
  };

  const unitStyle = {
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: '"Courier New", Courier, monospace',
    color: isHovered ? '#F3F4F6' : '#6B7280',
    transition: 'color 0.3s ease'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={titleStyle}>{titulo}</div>
      <div style={valueStyle}>{valor}</div>
      {(unidad || subtitulo) && (
        <div style={unitStyle}>{unidad || subtitulo}</div>
      )}
    </div>
  );
};

export default DashboardCard;
