import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { TokenService } from '../utils/token';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Vista de Inicio (Dashboard Principal)
 * Contiene un CSS Grid con 3 tarjetas proporcionales para Ventas del Día, Ventas del Mes e Inventario.
 * Los datos se consumen directamente desde el backend (/api/dashboard/metrics).
 */
const Inicio = () => {
  const [datosDashboard, setDatosDashboard] = useState({
    ventasDia: '$ 0000.0000',
    ventasMes: '$ 0000.0000',
    inventario: '0000.0000'
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const session  = TokenService.getUserSession();
        const tenantId = session?.tenantId || 'ferreteria';
        const res = await fetch(`${API_BASE}/dashboard/metrics`, {
          headers: { 'x-tenant-id': tenantId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.exito && data.metricas) {
            setDatosDashboard(data.metricas);
          }
        }
      } catch (err) {
        // Silencioso: usa datos de fallback
      }
    };
    fetchDatos();
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
