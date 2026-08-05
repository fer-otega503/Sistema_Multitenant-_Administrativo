import React, { useState, useEffect, useCallback } from 'react';
import { TokenService } from '../utils/token';

// ─── Constantes ──────────────────────────────────────────────────────────────
const DARK_HEADER = '#111634';
const FONT        = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ════════════════════════════════════════════════════════════════════════════
//  MODAL: DETALLES DEL PRODUCTO
// ════════════════════════════════════════════════════════════════════════════
const ProductDetailsModal = ({ producto, onClose }) => {
  if (!producto) return null;
  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={{ ...modalHeader, backgroundColor: DARK_HEADER }}>
          Producto Código: {producto.codigo}
        </div>
        <div style={modalBody}>
          <FieldRow label="Nombre:"       value={producto.nombre} />
          <div style={fieldBlock}>
            <span style={fieldLabel}>Descripción:</span>
            <p style={descText}>{producto.descripcion || '—'}</p>
          </div>
          <FieldRow label="Costo:"        value={`$${Number(producto.costo).toFixed(2)}`} mono />
          <FieldRow label="Precio Venta:" value={`$${Number(producto.precio_venta).toFixed(2)}`} mono />
          <FieldRow label="Unidad:"       value={producto.unidad} mono />
          <FieldRow label="Stock:"        value={Number(producto.stock).toFixed(2)} mono />
        </div>
        <div style={modalFooter}>
          <button
            style={btnOutlineBlue}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  MODAL: CONFIRMACIÓN DE ELIMINACIÓN
// ════════════════════════════════════════════════════════════════════════════
const DeleteConfirmModal = ({ cantidad, onConfirm, onCancel }) => (
  <div style={overlay}>
    <div style={{ ...modalBox, maxWidth: '420px' }}>
      <div style={{ ...modalHeader, backgroundColor: '#EF9A9A', color: '#7F1D1D' }}>
        ¡Cuidado!
      </div>
      <div style={{ ...modalBody, textAlign: 'center', padding: '28px 32px' }}>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '6px', fontWeight: '600' }}>
          ¿Estás seguro de realizar esta acción?
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 4px 0' }}>
          (Ya no podrá deshacerse)
        </p>
        {cantidad > 0 && (
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
            Se eliminarán <strong>{cantidad}</strong> producto{cantidad !== 1 ? 's' : ''} y sus registros en ventas.
          </p>
        )}
      </div>
      <div style={{ ...modalFooter, gap: '12px' }}>
        <button
          style={btnOutlineRed}
          onClick={onConfirm}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          Sí, eliminar
        </button>
        <button
          style={btnSolidBlue}
          onClick={onCancel}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          No
        </button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  MODAL: AGREGAR / EDITAR PRODUCTO  (formulario reutilizable)
// ════════════════════════════════════════════════════════════════════════════
const ProductFormModal = ({ productoInicial, onClose, onSaved, tenantId }) => {
  const isEdit = productoInicial !== null && productoInicial !== undefined;

  const emptyForm = {
    codigo: '', nombre: '', descripcion: '',
    costo: '', precio_venta: '', unidad: 'PZ', stock: '',
  };

  // Si es edición, pre-cargar los datos del producto
  const [form, setForm] = useState(
    isEdit
      ? {
          codigo:       productoInicial.codigo       ?? '',
          nombre:       productoInicial.nombre        ?? '',
          descripcion:  productoInicial.descripcion   ?? '',
          costo:        productoInicial.costo         ?? '',
          precio_venta: productoInicial.precio_venta  ?? '',
          unidad:       productoInicial.unidad        ?? 'PZ',
          stock:        productoInicial.stock         ?? '',
        }
      : emptyForm
  );

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleGuardar = async () => {
    const { codigo, nombre, costo, precio_venta, unidad } = form;
    if (!codigo.trim() || !nombre.trim() || !costo || !precio_venta || !unidad) {
      setFormError('Por favor llena todos los campos requeridos: Código, Nombre, Costo, Precio Venta y Unidad.');
      return;
    }

    setIsLoading(true);
    try {
      const url = isEdit
        ? `http://localhost:3000/api/inventario/productos/${productoInicial.id}`
        : `http://localhost:3000/api/inventario/productos`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          codigo:       form.codigo.trim(),
          nombre:       form.nombre.trim(),
          descripcion:  form.descripcion.trim(),
          costo:        Number(form.costo),
          precio_venta: Number(form.precio_venta),
          unidad:       form.unidad,
          stock:        Number(form.stock) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.error || `No se pudo ${isEdit ? 'editar' : 'agregar'} el producto. Intenta de nuevo.`);
        return;
      }

      const data = await res.json();
      if (data.exito) {
        onSaved(data.producto, isEdit);
        onClose();
      }
    } catch {
      setFormError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    border: '1.5px solid #D1D5DB',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: FONT,
    backgroundColor: '#FAFAFA',
    transition: 'border-color 0.2s',
  };

  const rowStyle  = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' };
  const labelStyle = {
    fontSize: '14px', fontWeight: '600', color: '#374151',
    minWidth: '110px', fontFamily: FONT,
  };

  const onFocus = e => (e.target.style.borderColor = '#2563EB');
  const onBlur  = e => (e.target.style.borderColor = '#D1D5DB');

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: '520px', width: '92%' }}>
        {/* Header */}
        <div style={{ ...modalHeader, backgroundColor: DARK_HEADER }}>
          {isEdit ? `Editar Producto — ${productoInicial.codigo}` : 'Agregar Un Producto'}
        </div>

        {/* Formulario */}
        <div style={{ ...modalBody, padding: '24px 28px' }}>
          {/* Código */}
          <div style={rowStyle}>
            <label style={labelStyle}>Código:</label>
            <input name="codigo" placeholder="Código" value={form.codigo}
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {/* Nombre */}
          <div style={rowStyle}>
            <label style={labelStyle}>Nombre:</label>
            <input name="nombre" placeholder="Nombre" value={form.nombre}
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {/* Descripción */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>Descripción:</label>
            <textarea name="descripcion" placeholder="Descripción" value={form.descripcion}
              onChange={handleChange} rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }}
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          {/* Costo */}
          <div style={rowStyle}>
            <label style={labelStyle}>Costo:</label>
            <input name="costo" placeholder="Costo" value={form.costo} type="number" min="0" step="0.01"
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {/* Precio Venta */}
          <div style={rowStyle}>
            <label style={labelStyle}>Precio Venta:</label>
            <input name="precio_venta" placeholder="Precio Venta" value={form.precio_venta} type="number" min="0" step="0.01"
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {/* Unidad */}
          <div style={rowStyle}>
            <label style={labelStyle}>Unidad:</label>
            <select name="unidad" value={form.unidad} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="PZ">PZ</option>
              <option value="KG">KG</option>
            </select>
          </div>
          {/* Stock */}
          <div style={rowStyle}>
            <label style={labelStyle}>Stock:</label>
            <input name="stock" placeholder="Stock" value={form.stock} type="number" min="0" step="0.01"
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Error */}
          {formError && (
            <div style={{
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '6px', padding: '10px 14px',
              fontSize: '13px', color: '#DC2626', marginTop: '4px',
            }}>
              {formError}
            </div>
          )}
        </div>

        {/* Botones */}
        <div style={{ ...modalFooter, gap: '12px' }}>
          <button
            style={btnOutlineBlue}
            onClick={handleGuardar}
            disabled={isLoading}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            {isLoading
              ? (isEdit ? 'Guardando...' : 'Agregando...')
              : (isEdit ? 'Guardar Cambios' : 'Agregar')}
          </button>
          <button
            style={btnSolidBlue}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL: INVENTARIO
// ════════════════════════════════════════════════════════════════════════════
const Inventario = () => {
  const session  = TokenService.getUserSession();
  const tenantId = session?.tenantId || 'ferreteria';

  // ── Datos y búsqueda ─────────────────────────────────────────────────────
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [productos,      setProductos]      = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [apiError,       setApiError]       = useState(null);

  // ── Modo eliminar ────────────────────────────────────────────────────────
  const [modoEliminar,  setModoEliminar]  = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  // ── Modales ──────────────────────────────────────────────────────────────
  const [modalDetalle,  setModalDetalle]  = useState(null);   // producto | null
  const [modalForm,     setModalForm]     = useState(null);   // null | 'add' | { producto }
  const [modalEliminar, setModalEliminar] = useState(false);

  // ── Fetch productos ───────────────────────────────────────────────────────
  const fetchProductos = useCallback(async (codigo = '') => {
    setIsLoading(true);
    setApiError(null);
    try {
      const url = codigo.trim()
        ? `http://localhost:3000/api/inventario/productos?codigo=${encodeURIComponent(codigo.trim())}`
        : `http://localhost:3000/api/inventario/productos`;

      const res = await fetch(url, { headers: { 'X-Tenant-ID': tenantId } });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || 'Error al cargar el inventario.');
        return;
      }
      const data = await res.json();
      if (data.exito) setProductos(data.productos);
    } catch {
      setApiError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  // ── Handlers toolbar ─────────────────────────────────────────────────────
  const handleConsultar = () => fetchProductos(codigoBusqueda);
  const handleKeyDown   = (e) => { if (e.key === 'Enter') handleConsultar(); };

  // ── Handlers modo eliminar ───────────────────────────────────────────────
  const handleEliminarClick    = () => { setModoEliminar(true); setSeleccionados([]); };
  const handleCancelarEliminar = () => { setModoEliminar(false); setSeleccionados([]); };

  const toggleSeleccion = (id) =>
    setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleConfirmarEliminar = () => {
    if (seleccionados.length === 0) return;
    setModalEliminar(true);
  };

  const handleEliminarConfirmado = async () => {
    setModalEliminar(false);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:3000/api/inventario/productos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({ ids: seleccionados }),
      });

      if (res.ok) {
        setProductos(prev => prev.filter(p => !seleccionados.includes(p.id)));
      } else {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || 'No se pudieron eliminar los productos.');
      }
    } catch {
      setApiError('Error de conexión al intentar eliminar.');
    } finally {
      setModoEliminar(false);
      setSeleccionados([]);
    }
  };

  // ── Clic en fila ─────────────────────────────────────────────────────────
  const handleRowClick = (producto) => {
    if (modoEliminar) {
      toggleSeleccion(producto.id);
    } else {
      setModalDetalle(producto);
    }
  };

  // ── Abrir edición (desde botón en la fila) ───────────────────────────────
  const handleEditarClick = (e, producto) => {
    e.stopPropagation(); // Evita abrir el modal de detalle al mismo tiempo
    setModalForm({ producto });
  };

  // ── Callback formulario guardado (agregar o editar) ──────────────────────
  const handleSaved = (productoGuardado, esEdicion) => {
    if (esEdicion) {
      setProductos(prev =>
        prev.map(p => p.id === productoGuardado.id ? productoGuardado : p)
      );
    } else {
      setProductos(prev =>
        [...prev, productoGuardado].sort((a, b) => a.codigo.localeCompare(b.codigo))
      );
    }
    // Si el modal de detalle estaba abierto para este producto, actualizarlo
    if (modalDetalle?.id === productoGuardado.id) {
      setModalDetalle(productoGuardado);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {/* ─── Barra de Herramientas ─────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <input
            id="inventario-busqueda-codigo"
            type="text"
            placeholder="Código"
            value={codigoBusqueda}
            onChange={e => setCodigoBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.inputCodigo}
          />
          <button
            id="inventario-btn-consultar"
            style={styles.btnOutline}
            onClick={handleConsultar}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Consultar
          </button>

          {!modoEliminar ? (
            <button
              id="inventario-btn-eliminar"
              style={styles.btnOutline}
              onClick={handleEliminarClick}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Eliminar
            </button>
          ) : (
            <>
              <button
                id="inventario-btn-confirmar-eliminar"
                style={{
                  ...styles.btnOutline,
                  borderColor: seleccionados.length > 0 ? '#EF4444' : '#D1D5DB',
                  color:       seleccionados.length > 0 ? '#DC2626' : '#9CA3AF',
                  cursor:      seleccionados.length > 0 ? 'pointer'  : 'not-allowed',
                }}
                onClick={handleConfirmarEliminar}
                disabled={seleccionados.length === 0}
                onMouseEnter={e => seleccionados.length > 0 && (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                Eliminar ({seleccionados.length})
              </button>
              <button
                id="inventario-btn-cancelar-eliminar"
                style={styles.btnOutline}
                onClick={handleCancelarEliminar}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Cancelar
              </button>
            </>
          )}
        </div>

        {/* Botón Agregar */}
        <button
          id="inventario-btn-agregar"
          style={styles.btnAgregar}
          onClick={() => setModalForm('add')}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Agregar
        </button>
      </div>

      {/* ─── Banner modo selección ─────────────────────────────────────── */}
      {modoEliminar && (
        <div style={styles.modoBanner}>
          🗑️&nbsp; Modo eliminación — haz clic en las filas que deseas borrar
          &nbsp;<strong>({seleccionados.length} seleccionada{seleccionados.length !== 1 ? 's' : ''})</strong>
        </div>
      )}

      {/* ─── Banner error API ──────────────────────────────────────────── */}
      {apiError && (
        <div style={styles.apiErrorBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {apiError}
        </div>
      )}

      {/* ─── Tabla ────────────────────────────────────────────────────── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              {modoEliminar && <th style={{ ...styles.th, width: '40px' }}></th>}
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Descripción</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Costo</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Precio Venta</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Unidad</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Existencias</th>
              {!modoEliminar && <th style={{ ...styles.th, textAlign: 'center', width: '70px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={modoEliminar ? 7 : 7} style={styles.emptyCell}>
                  <span style={styles.loadingText}>Cargando inventario...</span>
                </td>
              </tr>
            )}
            {!isLoading && productos.length === 0 && (
              <tr>
                <td colSpan={modoEliminar ? 7 : 7} style={styles.emptyCell}>
                  <span style={styles.emptyText}>Sin productos en el inventario</span>
                </td>
              </tr>
            )}
            {!isLoading && productos.map(p => (
              <TableRow
                key={p.id}
                producto={p}
                modoEliminar={modoEliminar}
                isSelected={seleccionados.includes(p.id)}
                onClick={() => handleRowClick(p)}
                onEditarClick={(e) => handleEditarClick(e, p)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── MODALES ───────────────────────────────────────────────────── */}

      {modalDetalle && (
        <ProductDetailsModal
          producto={modalDetalle}
          onClose={() => setModalDetalle(null)}
        />
      )}

      {modalEliminar && (
        <DeleteConfirmModal
          cantidad={seleccionados.length}
          onConfirm={handleEliminarConfirmado}
          onCancel={() => setModalEliminar(false)}
        />
      )}

      {modalForm && (
        <ProductFormModal
          productoInicial={modalForm === 'add' ? null : modalForm.producto}
          tenantId={tenantId}
          onClose={() => setModalForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTE: Fila con hover + botón Editar
// ════════════════════════════════════════════════════════════════════════════
const TableRow = ({ producto, modoEliminar, isSelected, onClick, onEditarClick }) => {
  const [hovered, setHovered] = useState(false);

  const rowBg = isSelected ? '#FEE2E2' : hovered ? '#F3F4F6' : '#FFFFFF';

  return (
    <tr
      style={{ backgroundColor: rowBg, cursor: 'pointer', transition: 'background 0.15s' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {modoEliminar && (
        <td style={{ ...styles.td, textAlign: 'center' }}>
          <input type="checkbox" checked={isSelected} onChange={() => {}}
            style={{ cursor: 'pointer', accentColor: '#2563EB' }} />
        </td>
      )}
      <td style={{ ...styles.td, fontFamily: '"Courier New",Courier,monospace', fontWeight: '600' }}>
        {producto.codigo}
      </td>
      <td style={styles.td}>{producto.nombre}</td>
      <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New",Courier,monospace' }}>
        ${Number(producto.costo).toFixed(2)}
      </td>
      <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New",Courier,monospace' }}>
        ${Number(producto.precio_venta).toFixed(2)}
      </td>
      <td style={{ ...styles.td, textAlign: 'center' }}>{producto.unidad}</td>
      <td style={{ ...styles.td, textAlign: 'right', fontFamily: '"Courier New",Courier,monospace' }}>
        {Number(producto.stock).toFixed(2)}
      </td>
      {!modoEliminar && (
        <td style={{ ...styles.td, textAlign: 'center', padding: '6px 10px' }}>
          <button
            title="Editar producto"
            onClick={onEditarClick}
            style={{
              border: '1px solid #D1D5DB',
              borderRadius: '5px',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: FONT,
              transition: 'all 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#EFF6FF';
              e.currentTarget.style.borderColor     = '#2563EB';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor     = '#D1D5DB';
            }}
          >
            <PencilIcon /> Editar
          </button>
        </td>
      )}
    </tr>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  ICONOS
// ════════════════════════════════════════════════════════════════════════════
const PencilIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTES AUXILIARES
// ════════════════════════════════════════════════════════════════════════════
const FieldRow = ({ label, value, mono }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottom: '1px solid #F3F4F6', padding: '10px 0', gap: '16px',
  }}>
    <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151', fontFamily: FONT }}>
      {label}
    </span>
    <span style={{
      fontSize: '14px', color: '#111827', textAlign: 'right',
      fontFamily: mono ? '"Courier New",Courier,monospace' : FONT,
    }}>
      {value}
    </span>
  </div>
);

const fieldBlock  = { borderBottom: '1px solid #F3F4F6', padding: '10px 0' };
const fieldLabel  = { fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '6px', fontFamily: FONT };
const descText    = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0, fontFamily: FONT };

// ════════════════════════════════════════════════════════════════════════════
//  ESTILOS COMPARTIDOS DE MODALES
// ════════════════════════════════════════════════════════════════════════════
const overlay = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(2px)',
};
const modalBox = {
  backgroundColor: '#FFFFFF', borderRadius: '10px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  width: '92%', maxWidth: '480px', overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
};
const modalHeader = {
  padding: '16px 24px', fontSize: '16px', fontWeight: '700',
  color: '#FFFFFF', fontFamily: FONT, letterSpacing: '0.3px', textAlign: 'center',
};
const modalBody = {
  padding: '20px 28px', fontFamily: FONT, overflowY: 'auto', maxHeight: '65vh',
};
const modalFooter = {
  display: 'flex', justifyContent: 'center', padding: '16px 24px 20px',
  borderTop: '1px solid #F3F4F6',
};

const btnOutlineBlue = {
  border: '1.5px solid #2563EB', borderRadius: '7px', backgroundColor: '#FFFFFF',
  color: '#2563EB', padding: '9px 28px', fontSize: '14px', fontWeight: '600',
  cursor: 'pointer', transition: 'background 0.2s', fontFamily: FONT,
};
const btnOutlineRed = {
  border: '1.5px solid #EF4444', borderRadius: '7px', backgroundColor: '#FFFFFF',
  color: '#DC2626', padding: '9px 28px', fontSize: '14px', fontWeight: '600',
  cursor: 'pointer', transition: 'background 0.2s', fontFamily: FONT,
};
const btnSolidBlue = {
  border: 'none', borderRadius: '7px', backgroundColor: '#2563EB',
  color: '#FFFFFF', padding: '9px 28px', fontSize: '14px', fontWeight: '600',
  cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: FONT,
};

// ════════════════════════════════════════════════════════════════════════════
//  ESTILOS PANTALLA PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
const styles = {
  wrapper: {
    padding: '28px 32px', width: '100%', boxSizing: 'border-box', fontFamily: FONT,
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '16px', gap: '10px', flexWrap: 'wrap',
  },
  toolbarLeft: {
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
  },
  inputCodigo: {
    border: '1.5px solid #D1D5DB', borderRadius: '6px', padding: '8px 14px',
    fontSize: '14px', color: '#374151', backgroundColor: '#FFFFFF', outline: 'none',
    width: '160px', fontFamily: FONT, transition: 'border-color 0.2s',
  },
  btnOutline: {
    border: '1.5px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF',
    color: '#374151', padding: '8px 20px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: FONT,
  },
  btnAgregar: {
    border: 'none', borderRadius: '6px', backgroundColor: DARK_HEADER,
    color: '#FFFFFF', padding: '9px 24px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: FONT, marginLeft: 'auto',
  },
  modoBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px',
    padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: '#92400E', fontFamily: FONT,
  },
  apiErrorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
    padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: '#DC2626', fontFamily: FONT,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
    borderRadius: '6px', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    backgroundColor: DARK_HEADER, color: '#FFFFFF', padding: '12px 16px',
    textAlign: 'left', fontWeight: '600', fontFamily: FONT, fontSize: '13px',
    letterSpacing: '0.3px', userSelect: 'none',
  },
  td: {
    padding: '11px 16px', color: '#1F2937', fontSize: '13px',
    borderBottom: '1px solid #F3F4F6', fontFamily: FONT,
  },
  emptyCell: { padding: '80px 20px', textAlign: 'center' },
  emptyText: { fontSize: '18px', color: '#D1D5DB', fontFamily: '"Courier New",Courier,monospace', letterSpacing: '0.5px' },
  loadingText: { fontSize: '16px', color: '#9CA3AF', fontFamily: '"Courier New",Courier,monospace', letterSpacing: '1px' },
};

export default Inventario;
