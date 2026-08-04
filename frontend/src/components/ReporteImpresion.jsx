import React, { useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ReporteImpresion
 * Vista de reporte de venta. Al montarse, genera y descarga automáticamente el PDF.
 * El usuario puede hacer clic en "Regresar" para volver a la pantalla de Ventas en estado vacío.
 *
 * Props:
 *  - venta:    { id, no_caja, total, fecha }
 *  - detalles: [{ descripcion, precio_unitario, cantidad, unidad, precio_venta }]
 *  - onRegresar: function — vuelve a la pantalla de Ventas vacía
 */
const ReporteImpresion = ({ venta, detalles, onRegresar }) => {

  // ──────────────────────────────────────────────────────────
  // Formatear fecha DD/MM/YYYY
  // ──────────────────────────────────────────────────────────
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '00/00/0000';
    const d = new Date(fechaStr);
    const dia  = String(d.getDate()).padStart(2, '0');
    const mes  = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const formatMXN = (n) => `$${Number(n).toFixed(2)}`;

  const fechaFormateada = formatFecha(venta?.fecha);
  const ventaId  = String(venta?.id ?? '0').padStart(5, '0');
  const noCaja   = venta?.no_caja ?? 'N/A';

  // ──────────────────────────────────────────────────────────
  // Auto-generar PDF al montar el componente
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    generarPDF();
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;

    // ── Cabecera: Logo placeholder ──
    // Dibuja un rectángulo como placeholder del logo
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.5);
    doc.rect(margin, 12, 38, 22);
    doc.setFontSize(6.5);
    doc.setTextColor(17, 24, 39);
    doc.setFont('courier', 'bold');
    doc.text('EL MARTILLO', margin + 19, 22, { align: 'center' });
    doc.text('FERRETERÍA', margin + 19, 27, { align: 'center' });

    // ── Título del reporte ──
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`Reporte Venta No. ${ventaId}`, pageW / 2 + 10, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Venta Realizada el: ${fechaFormateada}`, pageW / 2 + 10, 28, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(margin, 38, pageW - margin, 38);

    // ── Tabla de detalles ──
    const tableRows = detalles.map(d => [
      d.descripcion,
      formatMXN(d.precio_unitario),
      Number(d.cantidad).toFixed(2),
      d.unidad,
      formatMXN(d.precio_venta),
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['Artículo', 'Precio', 'Cantidad', 'Unidad', 'Total']],
      body: tableRows,
      styles: {
        font: 'courier',
        fontSize: 10,
        cellPadding: 5,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'right', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 28 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 30 },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: margin, right: margin },
    });

    // ── Total general ──
    const totalGeneral = detalles.reduce((acc, d) => acc + Number(d.precio_venta), 0);
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`TOTAL: ${formatMXN(totalGeneral)}`, pageW - margin, finalY, { align: 'right' });

    // ── Footer ──
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-MX')} • El Martillo Ferretería`,
      pageW / 2, 287, { align: 'center' }
    );

    doc.save(`Reporte_Venta_${ventaId}_${noCaja}.pdf`);
  };

  // ──────────────────────────────────────────────────────────
  // RENDER: Vista previa del reporte
  // ──────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Cabecera ── */}
        <div style={styles.reportHeader}>
          {/* Logo */}
          <div style={styles.logoBox}>
            <img
              src="/Logos/martillo.png"
              alt="El Martillo Ferretería"
              style={styles.logoImg}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Título */}
          <div style={styles.titleBlock}>
            <h1 style={styles.reportTitle}>Reporte Venta No. {ventaId}</h1>
            <p style={styles.reportSubtitle}>Venta Realizada el: {fechaFormateada}</p>
            <p style={styles.cajaLabel}>Caja: {noCaja}</p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* ── Tabla ── */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Artículo', 'Precio', 'Cantidad', 'Unidad', 'Total'].map(col => (
                  <th key={col} style={styles.th}>
                    <span style={styles.thContent}>
                      {col}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px', opacity: 0.7 }}>
                        <path d="M7 10l5 5 5-5" />
                      </svg>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalles.map((d, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={{ ...styles.td, color: '#2563EB', fontWeight: '600' }}>{d.descripcion}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${Number(d.precio_unitario).toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{Number(d.cantidad).toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{d.unidad}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>${Number(d.precio_venta).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Total ── */}
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>TOTAL:</span>
          <span style={styles.totalValue}>
            ${detalles.reduce((acc, d) => acc + Number(d.precio_venta), 0).toFixed(2)}
          </span>
        </div>

        {/* ── Info PDF ── */}
        <div style={styles.pdfNotice}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>El PDF se descargó automáticamente en tu equipo.</span>
        </div>

        {/* ── Botón Regresar ── */}
        <div style={styles.actions}>
          <button style={styles.btnVolver} onClick={generarPDF}>
            ⬇ Descargar PDF de nuevo
          </button>
          <button style={styles.btnRegresar} onClick={onRegresar}>
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#F3F4F6',
    padding: '32px 36px',
    boxSizing: 'border-box',
    fontFamily: '"Courier New", Courier, monospace',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '36px 40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    marginBottom: '20px',
  },
  logoBox: {
    width: '80px',
    height: '60px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    padding: '4px',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  titleBlock: {
    flex: 1,
  },
  reportTitle: {
    margin: '0 0 4px 0',
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  reportSubtitle: {
    margin: '0 0 2px 0',
    fontSize: '13px',
    color: '#6B7280',
    fontFamily: '"Courier New", Courier, monospace',
  },
  cajaLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#9CA3AF',
    fontFamily: '"Courier New", Courier, monospace',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E5E7EB',
    margin: '16px 0 24px 0',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
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
    whiteSpace: 'nowrap',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
  },
  td: {
    padding: '11px 16px',
    color: '#1F2937',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '13px',
    borderBottom: '1px solid #F3F4F6',
  },
  rowEven: { backgroundColor: '#FFFFFF' },
  rowOdd:  { backgroundColor: '#F9FAFB' },
  totalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '2px solid #111827',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: '"Courier New", Courier, monospace',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    fontFamily: '"Courier New", Courier, monospace',
  },
  pdfNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '10px 14px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#4B5563',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '28px',
  },
  btnVolver: {
    backgroundColor: 'transparent',
    border: '1.5px solid #9CA3AF',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    cursor: 'pointer',
    fontFamily: '"Courier New", Courier, monospace',
    transition: 'all 0.2s ease',
  },
  btnRegresar: {
    backgroundColor: '#111827',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: '"Courier New", Courier, monospace',
    transition: 'all 0.2s ease',
  },
};

export default ReporteImpresion;
