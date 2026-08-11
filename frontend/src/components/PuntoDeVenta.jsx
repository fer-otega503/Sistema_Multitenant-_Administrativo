import React, { useState } from 'react';
import { TokenService } from '../utils/token';
import ErrorModal from './ErrorModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PuntoDeVenta = () => {
  const session = TokenService.getUserSession();
  const tenantId = session?.tenantId || 'ferreteria';

  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [ticket, setTicket] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Agregar producto al ticket temporal
  const handleAgregar = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!codigo.trim() || cantidad <= 0) {
      setErrorMessage('Por favor ingresa un código de producto y una cantidad válida.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/inventario/productos?codigo=${encodeURIComponent(codigo.trim())}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });

      if (!res.ok) throw new Error('Error al buscar el producto');
      const data = await res.json();
      
      if (!data.exito || data.productos.length === 0) {
        throw new Error('Producto no encontrado con ese código.');
      }

      const producto = data.productos[0];
      
      // Verificar stock aproximado en frontend
      if (Number(producto.stock) < Number(cantidad)) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
      }

      // Añadir al ticket
      const idx = ticket.findIndex(item => item.id === producto.id);
      if (idx !== -1) {
        // Ya existe, sumar cantidad
        const newTicket = [...ticket];
        newTicket[idx].cantidad += Number(cantidad);
        setTicket(newTicket);
      } else {
        // Nuevo en ticket
        setTicket([...ticket, {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          cantidad: Number(cantidad)
        }]);
      }
      
      // Reset inputs
      setCodigo('');
      setCantidad(1);
    } catch (err) {
      setErrorMessage(err.message || 'Ocurrió un error al agregar el producto.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Realizar la venta en el backend
  const handleRealizarVenta = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (ticket.length === 0) {
      setErrorMessage('El ticket está vacío. Agrega productos primero.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const detalles = ticket.map(item => ({
        producto_id: item.codigo, // enviamos el código como ID, el backend lo resolverá
        cantidad: item.cantidad
      }));

      // No. de Caja podría venir del empleado o ser genérico, usamos CAJA-01 por ahora
      const no_caja = 'CAJA-01'; 

      const res = await fetch(`${API_BASE}/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          no_caja,
          detalles
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar la venta.');
      }

      setSuccessMessage(`¡Venta registrada con éxito! No. Venta: ${data.venta_id}`);
      setTicket([]); // Limpiar ticket
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión al registrar la venta.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTicket = ticket.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  return (
    <div style={styles.wrapper}>
      {/* ── Header ── */}
      <h2 style={styles.title}>Generar Nueva Venta</h2>
      
      {successMessage && (
        <div style={styles.successBanner}>
          {successMessage}
        </div>
      )}

      {/* ── Controles para Agregar Producto ── */}
      <div style={styles.inputContainer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>ID o Código del Producto</label>
          <input
            type="text"
            placeholder="Ej. 2026001"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAgregar()}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Cantidad (Manual / Sensor)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAgregar()}
            style={styles.input}
          />
        </div>

        <button 
          style={styles.btnAgregar}
          onClick={handleAgregar}
          disabled={isLoading}
        >
          {isLoading ? 'Buscando...' : 'Agregar'}
        </button>
      </div>

      {/* ── Tabla de Lista de Productos ── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '20%' }}>Código</th>
              <th style={{ ...styles.th, width: '40%' }}>Descripción</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>P. Unitario</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Cantidad</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {ticket.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  No hay productos en el ticket actual
                </td>
              </tr>
            ) : (
              ticket.map((item, i) => (
                <tr key={i} style={styles.dataRow}>
                  <td style={styles.td}>{item.codigo}</td>
                  <td style={styles.td}>{item.nombre}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${item.precio_venta.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.cantidad}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${(item.precio_venta * item.cantidad).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Total de Venta ── */}
        <div style={styles.totalContainer}>
           <span style={styles.totalLabel}>TOTAL A PAGAR:</span>
           <span style={styles.totalValue}>${totalTicket.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Botón Ok / Terminar Venta ── */}
      <div style={styles.actionsContainer}>
        <button 
          style={ticket.length === 0 ? styles.btnOkDisabled : styles.btnOk} 
          onClick={handleRealizarVenta}
          disabled={ticket.length === 0 || isLoading}
        >
          ¡Ok! Realizar Venta
        </button>
      </div>

      <ErrorModal 
        visible={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        message={errorMessage} 
      />
    </div>
  );
};

const styles = {
  wrapper: {
    padding: '28px 32px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    border: '1px solid #34D399',
    color: '#065F46',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    border: '1.5px solid #D1D5DB',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    width: '200px',
  },
  btnAgregar: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    height: '42px',
    transition: 'background 0.2s',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#111827',
    color: '#FFFFFF',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
  },
  emptyCell: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  dataRow: {
    borderBottom: '1px solid #F3F4F6',
  },
  td: {
    padding: '12px 16px',
    color: '#1F2937',
  },
  totalContainer: {
    backgroundColor: '#F9FAFB',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    borderTop: '2px solid #E5E7EB',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#374151',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnOk: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnOkDisabled: {
    backgroundColor: '#9CA3AF',
    color: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
  }
};

export default PuntoDeVenta;
