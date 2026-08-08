import React, { useState, useEffect, useCallback } from 'react';
import { TokenService } from '../utils/token';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DARK_HEADER = '#111634';
const FONT        = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const ROLES_EMPLEADO = ['Empleado', 'Gerente', 'Limpieza'];

// ════════════════════════════════════════════════════════════════════════════
//  MODAL: CONFIRMACIÓN DE ELIMINACIÓN
// ════════════════════════════════════════════════════════════════════════════
const DeleteEmployeeModal = ({ empleado, onConfirm, onCancel }) => (
  <div style={overlay}>
    <div style={{ ...modalBox, maxWidth: '420px' }}>
      <div style={{ ...modalHeader, backgroundColor: '#EF9A9A', color: '#7F1D1D' }}>
        ¡Cuidado!
      </div>
      <div style={{ ...modalBody, textAlign: 'center', padding: '28px 32px' }}>
        <p style={{ fontSize: '16px', color: '#374151', marginBottom: '6px', fontWeight: '600' }}>
          ¿Estás seguro de realizar esta acción?
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px 0' }}>
          (Ya no podrá deshacerse)
        </p>
        {empleado && (
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
            Se eliminará al empleado <strong>{empleado.nombre} {empleado.apellido_p}</strong>.
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
//  MODAL: AGREGAR / EDITAR EMPLEADO  (formulario reutilizable)
// ════════════════════════════════════════════════════════════════════════════
const EmployeeFormModal = ({ empleadoInicial, onClose, onSaved, tenantId }) => {
  const isEdit = empleadoInicial != null;

  const emptyForm = {
    nombre: '', apellido_p: '', apellido_m: '',
    email: '', password: '', no_caja: '', rol: 'Empleado',
  };

  const [form, setForm] = useState(
    isEdit
      ? {
          nombre:     empleadoInicial.nombre     ?? '',
          apellido_p: empleadoInicial.apellido_p ?? '',
          apellido_m: empleadoInicial.apellido_m ?? '',
          email:      empleadoInicial.email       ?? '',
          password:   '',   // siempre vacía por seguridad — solo actualiza si se rellena
          no_caja:    empleadoInicial.no_caja     ?? '',
          rol:        empleadoInicial.rol         ?? 'Empleado',
        }
      : emptyForm
  );

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cajasDisponibles, setCajasDisponibles] = useState([]);

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/ventas/cajas', {
          headers: { 'X-Tenant-ID': tenantId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.exito) setCajasDisponibles(data.cajas);
        }
      } catch (err) {
        console.error('Error al obtener cajas:', err);
      }
    };
    fetchCajas();
  }, [tenantId]);


  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.rol) {
      setFormError('Por favor completa los campos requeridos: Nombre, Email y Rol.');
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setFormError('La contraseña es obligatoria para crear un nuevo empleado.');
      return;
    }

    setIsLoading(true);
    try {
      const url    = isEdit
        ? `http://localhost:3000/api/empleados/${empleadoInicial.id}`
        : `http://localhost:3000/api/empleados`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          nombre:     form.nombre.trim(),
          apellido_p: form.apellido_p.trim(),
          apellido_m: form.apellido_m.trim(),
          email:      form.email.trim(),
          password:   form.password.trim(),   // vacío = no cambia en backend
          no_caja:    form.no_caja.trim(),
          rol:        form.rol,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFormError(err.error || `No se pudo ${isEdit ? 'editar' : 'agregar'} el empleado.`);
        return;
      }

      const data = await res.json();
      if (data.exito) {
        onSaved(data.empleado, isEdit);
        onClose();
      }
    } catch {
      setFormError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Estilos internos del formulario ────────────────────────────────────
  const inputStyle = {
    border: '1.5px solid #D1D5DB', borderRadius: '6px', padding: '8px 12px',
    fontSize: '14px', color: '#374151', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: FONT, backgroundColor: '#FAFAFA',
    transition: 'border-color 0.2s',
  };
  const rowStyle   = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' };
  const labelStyle = {
    fontSize: '14px', fontWeight: '600', color: '#374151',
    minWidth: '120px', flexShrink: 0, fontFamily: FONT,
  };
  const onFocus = e => (e.target.style.borderColor = '#2563EB');
  const onBlur  = e => (e.target.style.borderColor = '#D1D5DB');

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: '540px', width: '94%' }}>
        {/* Header */}
        <div style={{ ...modalHeader, backgroundColor: DARK_HEADER }}>
          {isEdit ? `Editar Empleado — ${empleadoInicial.nombre}` : 'Agregar Un Empleado'}
        </div>

        {/* Formulario */}
        <div style={{ ...modalBody, padding: '22px 28px' }}>

          {/* Nombre */}
          <div style={rowStyle}>
            <label style={labelStyle}>Nombre: <Req /></label>
            <input name="nombre" placeholder="Nombre" value={form.nombre}
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Apellido Paterno */}
          <div style={rowStyle}>
            <label style={labelStyle}>Apellido P:</label>
            <input name="apellido_p" placeholder="Apellido Paterno" value={form.apellido_p}
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Apellido Materno */}
          <div style={rowStyle}>
            <label style={labelStyle}>Apellido M:</label>
            <input name="apellido_m" placeholder="Apellido Materno" value={form.apellido_m}
              onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Email */}
          <div style={rowStyle}>
            <label style={labelStyle}>Email: <Req /></label>
            <input name="email" placeholder="correo@ejemplo.com" value={form.email}
              type="email" onChange={handleChange} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Caja Asignada */}
          <div style={rowStyle}>
            <label style={labelStyle}>Caja Asignada:</label>
            <select name="no_caja" value={form.no_caja} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
              <option value="">-- Seleccionar --</option>
              {cajasDisponibles.map(caja => (
                <option key={caja} value={caja}>{caja}</option>
              ))}
            </select>
          </div>

          {/* Contraseña */}
          <div style={rowStyle}>
            <label style={labelStyle}>
              Contraseña:{!isEdit && <Req />}
            </label>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input name="password" value={form.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Nueva contraseña'}
                onChange={handleChange}
                style={{ ...inputStyle, width: '100%', paddingRight: '40px' }}
                onFocus={onFocus} onBlur={onBlur}
              />
              {/* Botón ojo */}
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                style={{
                  position: 'absolute', right: '10px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px', color: '#9CA3AF', lineHeight: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>


          {/* Rol */}
          <div style={rowStyle}>
            <label style={labelStyle}>Rol: <Req /></label>
            <select name="rol" value={form.rol} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {ROLES_EMPLEADO.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
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

          {/* Nota si es edición */}
          {isEdit && (
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '10px 0 0', fontFamily: FONT }}>
              * Deja la contraseña vacía si no deseas modificarla.
            </p>
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
              : (isEdit ? 'Aceptar' : 'Agregar')}
          </button>
          <button
            style={btnSolidBlue}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL: EMPLEADOS
// ════════════════════════════════════════════════════════════════════════════
const Empleados = () => {
  const session  = TokenService.getUserSession();
  const tenantId = session?.tenantId || 'ferreteria';
  const adminId  = session?.id       || null;  // ID del admin logueado → protegido de edición

  // ── Datos y búsqueda ─────────────────────────────────────────────────────
  const [busqueda,   setBusqueda]   = useState('');
  const [empleados,  setEmpleados]  = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [apiError,   setApiError]   = useState(null);

  // ── Modales ──────────────────────────────────────────────────────────────
  const [modalForm,    setModalForm]    = useState(null);   // null | 'add' | { empleado }
  const [modalDelete,  setModalDelete]  = useState(null);   // null | empleado

  // ── Fetch empleados ───────────────────────────────────────────────────────
  const fetchEmpleados = useCallback(async (nombre = '') => {
    setIsLoading(true);
    setApiError(null);
    try {
      const url = nombre.trim()
        ? `http://localhost:3000/api/empleados?nombre=${encodeURIComponent(nombre.trim())}`
        : `http://localhost:3000/api/empleados`;

      const res = await fetch(url, {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Admin-ID':  String(adminId ?? ''),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || 'Error al cargar la lista de empleados.');
        return;
      }
      const data = await res.json();
      if (data.exito) setEmpleados(data.empleados);
    } catch {
      setApiError('Error de conexión. Verifica que el servidor esté encendido.');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, adminId]);

  useEffect(() => { fetchEmpleados(); }, [fetchEmpleados]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleConsultar = () => fetchEmpleados(busqueda);
  const handleKeyDown   = (e) => { if (e.key === 'Enter') handleConsultar(); };

  const handleSaved = (empleadoGuardado, esEdicion) => {
    if (esEdicion) {
      setEmpleados(prev => prev.map(e => e.id === empleadoGuardado.id ? empleadoGuardado : e));
    } else {
      setEmpleados(prev => [...prev, empleadoGuardado]);
    }
  };

  const handleEliminarConfirmado = async () => {
    if (!modalDelete) return;
    setApiError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/empleados/${modalDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Admin-ID':  String(adminId ?? ''),
        },
      });

      if (res.ok) {
        setEmpleados(prev => prev.filter(e => e.id !== modalDelete.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || 'No se pudo eliminar el empleado.');
      }
    } catch {
      setApiError('Error de conexión al intentar eliminar.');
    } finally {
      setModalDelete(null);
    }
  };

  // ─── Nombre completo para mostrar ────────────────────────────────────────
  const nombreCompleto = (e) =>
    [e.nombre, e.apellido_p, e.apellido_m].filter(Boolean).join(' ');

  // ─── Chip de rol ─────────────────────────────────────────────────────────
  const rolChipStyle = (rol) => {
    const map = {
      Administrador: { bg: '#DBEAFE', color: '#1D4ED8' },
      Admin:         { bg: '#DBEAFE', color: '#1D4ED8' },
      Gerente:       { bg: '#D1FAE5', color: '#065F46' },
      Empleado:      { bg: '#F3F4F6', color: '#374151' },
      Limpieza:      { bg: '#FEF9C3', color: '#854D0E' },
    };
    const c = map[rol] || { bg: '#F3F4F6', color: '#374151' };
    return {
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: '600', backgroundColor: c.bg, color: c.color,
      fontFamily: FONT, whiteSpace: 'nowrap',
    };
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {/* ─── Barra de Herramientas ──────────────────────────────────────── */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <input
            id="empleados-busqueda"
            type="text"
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.inputBusqueda}
          />
          <button
            id="empleados-btn-consultar"
            style={styles.btnOutline}
            onClick={handleConsultar}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Consultar
          </button>
        </div>

        <button
          id="empleados-btn-agregar"
          style={styles.btnAgregar}
          onClick={() => setModalForm('add')}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Agregar
        </button>
      </div>

      {/* ─── Banner error ──────────────────────────────────────────────── */}
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

      {/* ─── Tabla ─────────────────────────────────────────────────────── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '80px' }}>ID-Empleado</th>
              <th style={styles.th}>Nombre Completo</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Caja Asignada</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Rol Asignado</th>
              <th style={{ ...styles.th, textAlign: 'center', width: '110px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {/* Cargando */}
            {isLoading && (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  <span style={styles.loadingText}>Cargando empleados...</span>
                </td>
              </tr>
            )}

            {/* Sin datos */}
            {!isLoading && empleados.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  <span style={styles.emptyText}>No hay empleados registrados</span>
                </td>
              </tr>
            )}

            {/* Filas */}
            {!isLoading && empleados.map(emp => {
              const esPropioAdmin = String(emp.id) === String(adminId);
              const esAdmin       = ['Administrador', 'Admin'].includes(emp.rol);

              return (
                <EmpleadoRow
                  key={emp.id}
                  empleado={emp}
                  nombreCompleto={nombreCompleto(emp)}
                  rolChipStyle={rolChipStyle(emp.rol)}
                  esProtegido={esPropioAdmin || esAdmin}   // admins no se pueden editar/borrar
                  onEditar={() => setModalForm({ empleado: emp })}
                  onEliminar={() => setModalDelete(emp)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── MODALES ───────────────────────────────────────────────────── */}

      {modalDelete && (
        <DeleteEmployeeModal
          empleado={modalDelete}
          onConfirm={handleEliminarConfirmado}
          onCancel={() => setModalDelete(null)}
        />
      )}

      {modalForm && (
        <EmployeeFormModal
          empleadoInicial={modalForm === 'add' ? null : modalForm.empleado}
          tenantId={tenantId}
          onClose={() => setModalForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTE: Fila de empleado
// ════════════════════════════════════════════════════════════════════════════
const EmpleadoRow = ({ empleado, nombreCompleto, rolChipStyle, esProtegido, onEditar, onEliminar }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      style={{ backgroundColor: hovered ? '#F9FAFB' : '#FFFFFF', transition: 'background 0.15s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ID con badge */}
      <td style={{ ...styles.td, textAlign: 'center' }}>
        <span style={{
          fontFamily: '"Courier New",Courier,monospace', fontWeight: '700',
          fontSize: '12px', color: '#4B5563',
        }}>
          #{String(empleado.id).padStart(4, '0')}
        </span>
      </td>

      {/* Nombre Completo + email */}
      <td style={styles.td}>
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
          {nombreCompleto}
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
          {empleado.email}
        </div>
      </td>

      {/* Caja */}
      <td style={{ ...styles.td, textAlign: 'center' }}>
        {empleado.no_caja
          ? <span style={{ fontFamily: '"Courier New",Courier,monospace', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              {empleado.no_caja}
            </span>
          : <span style={{ color: '#D1D5DB', fontSize: '13px' }}>—</span>
        }
      </td>

      {/* Rol */}
      <td style={{ ...styles.td, textAlign: 'center' }}>
        <span style={rolChipStyle}>{empleado.rol}</span>
      </td>

      {/* Acciones */}
      <td style={{ ...styles.td, textAlign: 'center', padding: '8px 12px' }}>
        {esProtegido ? (
          <span style={{ fontSize: '12px', color: '#D1D5DB', fontFamily: FONT }}>—</span>
        ) : (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            {/* Botón Editar */}
            <IconButton
              title="Editar empleado"
              color="#2563EB"
              hoverBg="#EFF6FF"
              onClick={onEditar}
            >
              <PencilIcon />
            </IconButton>

            {/* Botón Eliminar */}
            <IconButton
              title="Eliminar empleado"
              color="#DC2626"
              hoverBg="#FEF2F2"
              onClick={onEliminar}
            >
              <TrashIcon />
            </IconButton>
          </div>
        )}
      </td>
    </tr>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTE: Botón de ícono reutilizable
// ════════════════════════════════════════════════════════════════════════════
const IconButton = ({ children, title, color, hoverBg, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        border: `1px solid ${hovered ? color : '#E5E7EB'}`,
        borderRadius: '6px',
        backgroundColor: hovered ? hoverBg : '#FFFFFF',
        color,
        cursor: 'pointer',
        padding: '6px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        lineHeight: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  ÍCONOS SVG
// ════════════════════════════════════════════════════════════════════════════
const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Pequeño asterisco de campo requerido
const Req = () => (
  <span style={{ color: '#EF4444', marginLeft: '2px', fontSize: '12px' }}>*</span>
);

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
  padding: '20px 28px', fontFamily: FONT, overflowY: 'auto', maxHeight: '70vh',
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
    marginBottom: '20px', gap: '10px', flexWrap: 'wrap',
  },
  toolbarLeft: {
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
  },
  inputBusqueda: {
    border: '1.5px solid #D1D5DB', borderRadius: '6px', padding: '8px 14px',
    fontSize: '14px', color: '#374151', backgroundColor: '#FFFFFF', outline: 'none',
    width: '200px', fontFamily: FONT, transition: 'border-color 0.2s',
  },
  btnOutline: {
    border: '1.5px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFFFFF',
    color: '#374151', padding: '8px 20px', fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: FONT,
  },
  btnAgregar: {
    border: 'none', borderRadius: '6px', backgroundColor: DARK_HEADER,
    color: '#FFFFFF', padding: '9px 24px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: FONT,
  },
  apiErrorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
    padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#DC2626', fontFamily: FONT,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
    borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    backgroundColor: DARK_HEADER, color: '#FFFFFF', padding: '13px 16px',
    textAlign: 'left', fontWeight: '600', fontFamily: FONT, fontSize: '13px',
    letterSpacing: '0.3px', userSelect: 'none',
  },
  td: {
    padding: '12px 16px', color: '#1F2937', fontSize: '13px',
    borderBottom: '1px solid #F3F4F6', fontFamily: FONT,
    verticalAlign: 'middle',
  },
  emptyCell: { padding: '80px 20px', textAlign: 'center' },
  emptyText: { fontSize: '18px', color: '#D1D5DB', fontFamily: '"Courier New",Courier,monospace', letterSpacing: '0.5px' },
  loadingText: { fontSize: '16px', color: '#9CA3AF', fontFamily: '"Courier New",Courier,monospace', letterSpacing: '1px' },
};

export default Empleados;
