import React, { useState } from 'react';
import DashboardCard from './DashboardCard';

/**
 * Vista de Inicio (Dashboard Principal)
 * Muestra el grid proporcional de 3 tarjetas métricas.
 */
const Inicio: React.FC = () => {
  const [datosDashboard] = useState({
    ventasDia: '$ 0000.0000',
    ventasMes: '$ 0000.0000',
    inventario: '0000.0000'
  });

  return (
    <div style={styles.container}>
      <div style={styles.gridContainer}>
        <DashboardCard 
          titulo="Ventas del Dia" 
          valor={datosDashboard.ventasDia} 
          unidad="MX" 
        />
        <DashboardCard 
          titulo="Ventas del Mes" 
          valor={datosDashboard.ventasMes} 
          unidad="MX" 
        />
        <DashboardCard 
          titulo="Inventario" 
          valor={datosDashboard.inventario} 
          unidad="Stock" 
        />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '36px',
    width: '100%',
    boxSizing: 'border-box'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%'
  }
};

export default Inicio;
