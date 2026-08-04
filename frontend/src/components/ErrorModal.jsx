import React from 'react';

/**
 * ErrorModal
 * Modal de error que se muestra cuando el usuario intenta consultar sin llenar los campos.
 * Props:
 *  - visible: boolean — controla si el modal se muestra
 *  - onClose: function — callback para cerrar el modal
 */
const ErrorModal = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        {/* Cabecera roja */}
        <div style={styles.header}>
          <span style={styles.headerText}>¡ERROR!</span>
        </div>

        {/* Cuerpo */}
        <div style={styles.body}>
          <p style={styles.message}>
            Debes de <strong>LLENAR</strong> los campos con el{' '}
            <strong>No. Venta</strong> y el <strong>No. Caja</strong>
          </p>

          {/* Botón Ok */}
          <button style={styles.okButton} onClick={onClose}>
            Ok!
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
    width: '320px',
    overflow: 'hidden',
    fontFamily: '"Courier New", Courier, monospace',
  },
  header: {
    backgroundColor: '#F87171',
    padding: '14px 20px',
    textAlign: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: '18px',
    letterSpacing: '1px',
    fontFamily: '"Courier New", Courier, monospace',
  },
  body: {
    padding: '24px 28px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  message: {
    color: '#1F2937',
    fontSize: '15px',
    textAlign: 'center',
    lineHeight: '1.6',
    margin: 0,
    fontFamily: '"Courier New", Courier, monospace',
  },
  okButton: {
    border: '1.5px solid #9CA3AF',
    backgroundColor: 'transparent',
    borderRadius: '20px',
    padding: '8px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: '"Courier New", Courier, monospace',
    transition: 'all 0.2s ease',
  },
};

export default ErrorModal;
