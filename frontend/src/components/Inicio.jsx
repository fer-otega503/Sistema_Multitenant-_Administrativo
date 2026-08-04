import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';

/**
 * Vista de Inicio (Dashboard Principal)
 * Contiene un CSS Grid con 3 tarjetas proporcionales para Ventas del Día, Ventas del Mes e Inventario.
 * Los datos se pueden conectar directamente al backend.
 */
const Inicio = () => {
  // Estado inicial listo para vincular datos desde el backend
  const [datosDashboard, setDatosDashboard] = useState({
    ventasDia: '$ 0000.0000',
    ventasMes: '$ 0000.0000',
    inventario: '0000.0000'
  });

  useEffect(() => {
    // Código sugerido para conectar con tu API backend:
    // const fetchDatos = async () => {
    //   try {
    //     const res = await fetch('/api/dashboard/summary');
    //     const data = await res.json();
    //     setDatosDashboard(data);
    //   } catch (error) {
    //     console.error('Error obteniendo métricas del backend:', error);
    //   }
    // };
    // fetchDatos();
  }, []);

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

const styles = {
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
