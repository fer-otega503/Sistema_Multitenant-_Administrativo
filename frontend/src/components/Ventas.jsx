import React, { useState } from 'react';
import { TokenService } from '../utils/token';
import ErrorModal from './ErrorModal';
import ReporteImpresion from './ReporteImpresion';

/**
 * Ventas
 * Pantalla de consulta de ventas para el Administrador.
 * Estados: vacío → cargando → con datos → error → reporte (PDF)
 */
const Ventas = () => {
  // ── Inputs de búsqueda ──
  const [noVenta, setNoVenta] = useState('');
  const [noCaja, setNoCaja]   = useState('');

  // ── Estados de UI ──
  const [isLoading,    setIsLoading]    = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [apiError,     setApiError]     = useState(null);
  const [showReporte,  setShowReporte]  = useState(false);

  // ── Datos de la venta consultada ──
  const [ventaData,    setVentaData]    = useState(null);   // { id, no_caja, total, fecha }
  const [detalles,     setDetalles]     = useState([]);     // [ { descripcion, precio_unitario, cantidad, unidad, precio_venta } ]

  const hasData = detalles.length > 0;

  // ──────────────────────────────────────────────────────────
  // Lógica principal: Consultar venta
  // ──────────────────────────────────────────────────────────
  const handleConsultar = async () => {
    setApiError(null);

    // Validación: ambos campos requeridos
    if (!noVenta.trim() || !noCaja.trim()) {
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    setDetalles([]);
    setVentaData(null);

    try {
      const session   = TokenService.getUserSession();
      const tenantId  = session?.tenantId || 'ferreteria';

      const res = await fetch(
        `http://localhost:3000/api/ventas/detalle?sell_id=${encodeURIComponent(noVenta.trim())}&no_caja=${encodeURIComponent(noCaja.trim())}`,
        {
          headers: { 'X-Tenant-ID': tenantId },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || 'No se encontró la venta. Verifica el No. Venta y No. Caja.');
        return;
      }

      const data = await res.json();
      if (data.exito && data.detalles) {
        setVentaData(data.venta);
        setDetalles(data.detalles);
      }

    } catch (err) {
      setApiError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // Abrir reporte (genera PDF automáticamente)
  // ──────────────────────────────────────────────────────────
  const handleImprimir = () => {
    setShowReporte(true);
  };

  // ──────────────────────────────────────────────────────────
  // Volver a estado vacío desde el reporte
  // ──────────────────────────────────────────────────────────
  const handleRegresar = () => {
    setShowReporte(false);
    setNoVenta('');
    setNoCaja('');
    setDetalles([]);
    setVentaData(null);
    setApiError(null);
  };

  // ──────────────────────────────────────────────────────────
  // RENDER: Vista de Reporte (pantalla completa dentro del content area)
  // ──────────────────────────────────────────────────────────
  if (showReporte) {
    return (
      <ReporteImpresion
        venta={ventaData}
        detalles={detalles}
        onRegresar={handleRegresar}
      />
    );
  }

  // ──────────────────────────────────────────────────────────
  // RENDER: Pantalla principal de Ventas
  // ──────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {/* ── Barra de Búsqueda ── */}
      <div style={styles.searchBar}>
        {/* Ícono código de barras */}
        <div style={styles.barcodeIcon}>
          <BarcodeIcon />
        </div>

        {/* Input No. Venta */}
        <input
          type="text"
          placeholder="No. Venta"
          value={noVenta}
          onChange={e => { setNoVenta(e.target.value); setApiError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleConsultar()}
          style={styles.input}
        />

        {/* Input No. Caja */}
        <input
          type="text"
          placeholder="No. Caja"
          value={noCaja}
          onChange={e => { setNoCaja(e.target.value); setApiError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleConsultar()}
          style={styles.input}
        />

        {/* Botón Consultar */}
        <button
          style={styles.btnConsultar}
          onClick={handleConsultar}
          disabled={isLoading}
        >
          {isLoading ? 'Buscando...' : 'Consultar'}
        </button>

        {/* Botón Imprimir (solo si hay datos) */}
        {hasData && (
          <button
            style={styles.btnImprimir}
            onClick={handleImprimir}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
        )}
      </div>

      {/* ── Mensaje de error de API ── */}
      {apiError && (
        <div style={styles.apiErrorBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {apiError}
        </div>
      )}

      {/* ── Tabla ── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          {/* Cabecera fija */}
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '38%' }}>Descripción</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Precio Unitario</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Cantidad</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Unidad</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Precio Venta</th>
            </tr>
          </thead>

          <tbody>
            {/* Estado: Cargando */}
            {isLoading && (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  <div style={styles.loadingText}>Consultando...</div>
                </td>
              </tr>
            )}

            {/* Estado: Vacío (sin datos y sin carga) */}
            {!isLoading && !hasData && (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  <span style={styles.emptyText}>Ingresa Un No.Venta Y Caja</span>
                </td>
              </tr>
            )}

            {/* Estado: Con Datos */}
            {!isLoading && hasData && detalles.map((row, i) => (
              <tr key={i} style={styles.dataRow}>
                <td style={styles.td}>
                  <span style={styles.articuloText}>{row.descripcion}</span>
                  <span style={styles.dots}></span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", Courier, monospace' }}>
                  ${Number(row.precio_unitario).toFixed(2)}
                </td>
                <td style={{ ...styles.td, textAlign: 'center', fontFamily: '"Courier New", Courier, monospace' }}>
                  {Number(row.cantidad).toFixed(2)}
                </td>
                <td style={{ ...styles.td, textAlign: 'center', fontFamily: '"Courier New", Courier, monospace' }}>
                  {row.unidad}
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New", Courier, monospace' }}>
                  ${Number(row.precio_venta).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total si hay datos */}
        {hasData && (
          <div style={styles.totalBar}>
            <span style={styles.totalLabel}>TOTAL:</span>
            <span style={styles.totalValue}>
              ${detalles.reduce((acc, d) => acc + Number(d.precio_venta), 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* ── Modal de Error de validación ── */}
      <ErrorModal visible={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// Ícono de código de barras (SVG inline)
// ──────────────────────────────────────────────────────────
const BarcodeIcon = () => (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0"  y="0" width="2" height="22" fill="#374151"/>
    <rect x="4"  y="0" width="1" height="22" fill="#374151"/>
    <rect x="7"  y="0" width="3" height="22" fill="#374151"/>
    <rect x="12" y="0" width="1" height="22" fill="#374151"/>
    <rect x="15" y="0" width="2" height="22" fill="#374151"/>
    <rect x="19" y="0" width="1" height="22" fill="#374151"/>
    <rect x="22" y="0" width="3" height="22" fill="#374151"/>
    <rect x="27" y="0" width="1" height="22" fill="#374151"/>
  </svg>
);

// ──────────────────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    padding: '28px 32px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // ── Barra de búsqueda ──
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  barcodeIcon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '4px',
  },
  input: {
    border: '1.5px solid #D1D5DB',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    width: '180px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'border-color 0.2s',
  },
  btnConsultar: {
    border: '1.5px solid #9CA3AF',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  btnImprimir: {
    border: '1.5px solid #9CA3AF',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    padding: '8px 18px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    marginLeft: 'auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  // ── Error de API ──
  apiErrorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#DC2626',
    fontFamily: '"Courier New", Courier, monospace',
  },

  // ── Tabla ──
  tableContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    backgroundColor: '#111827',
    color: '#FFFFFF',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '13px',
    letterSpacing: '0.3px',
  },
  emptyCell: {
    padding: '100px 20px',
    textAlign: 'center',
    borderTop: '1px solid #F3F4F6',
  },
  emptyText: {
    fontSize: '28px',
    color: '#D1D5DB',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: '400',
    letterSpacing: '1px',
    userSelect: 'none',
  },
  loadingText: {
    fontSize: '18px',
    color: '#9CA3AF',
    fontFamily: '"Courier New", Courier, monospace',
    letterSpacing: '2px',
  },
  dataRow: {
    borderBottom: '1px dashed #E5E7EB',
    transition: 'background 0.15s',
  },
  td: {
    padding: '11px 16px',
    color: '#1F2937',
    fontSize: '13px',
    maxWidth: '0',
  },
  articuloText: {
    display: 'block',
    fontFamily: '"Courier New", Courier, monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '280px',
  },
  dots: {
    display: 'none',
  },

  // ── Total ──
  totalBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderTop: '2px solid #111827',
    backgroundColor: '#F9FAFB',
  },
  totalLabel: {
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: '700',
    fontSize: '13px',
    color: '#374151',
  },
  totalValue: {
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: '800',
    fontSize: '15px',
    color: '#111827',
  },
};

export default Ventas;
