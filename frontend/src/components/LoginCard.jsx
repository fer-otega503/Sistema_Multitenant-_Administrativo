import { useState } from 'react';
import { authenticateUser } from '../services/api';
import SpecularButton from './SpecularButton';

export const LoginCard = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    tenant: 'schema_ferreteria',
  });

  const [authState, setAuthState] = useState({
    isLoading: false,
    successMessage: '',
    errorMessage: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const executeSubmit = async (e) => {
    if (authState.isLoading) return;
    if (e && e.preventDefault) e.preventDefault();
    
    setAuthState({ isLoading: true, successMessage: '', errorMessage: '' });

    try {
      const data = await authenticateUser(
        credentials.username,
        credentials.password,
        credentials.tenant
      );

      localStorage.setItem('session_token', data.token);

      setAuthState({
        isLoading: false,
        successMessage: `Acceso Concedido. Operador: ${data.usuario.nombre}`,
        errorMessage: '',
      });
    } catch (error) {
      setAuthState({
        isLoading: false,
        successMessage: '',
        errorMessage: error.message || 'Error de autenticación',
      });
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        
        <form onSubmit={executeSubmit} style={styles.form}>
          
          {/* Input: Email */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>✉️</span>
            <input 
              name="username"
              type="text" 
              placeholder="Correo electrónico" 
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={authState.isLoading}
              style={styles.input}
            />
          </div>

          {/* Input: Password */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>🔒</span>
            <input 
              name="password"
              type="password" 
              placeholder="Contraseña" 
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={authState.isLoading}
              style={styles.input}
            />
          </div>

          <div style={styles.utilitiesRow}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={styles.checkbox} /> Recordarme
            </label>
          </div>

          {/* Botón Especular Ajustado */}
          <div style={styles.buttonContainer}>
            <SpecularButton
              size="lg"
              radius={14}
              tint="#ffffff"
              tintOpacity={0.08}
              blur={12}
              textColor="#ffffff" // Texto en blanco puro garantizado
              lineColor="rgba(255, 255, 255, 0.85)"
              baseColor="rgba(30, 41, 59, 0.7)" // Base oscura semi-transparente para contrastar el brillo
              intensity={1.8} // Aumentamos la fuerza del destello
              shineSize={14}
              shineFade={25}
              thickness={1.5}
              speed={0.4}
              followMouse={!authState.isLoading}
              proximity={250}
              autoAnimate={authState.isLoading}
              onClick={executeSubmit}
            >
              {authState.isLoading ? 'Autenticando...' : 'Ingresar al Sistema'}
            </SpecularButton>
          </div>

          {/* Link cambiado a ¿Olvidaste tu contraseña? */}
          <p style={styles.forgotPrompt}>
            <span style={styles.forgotLink}>¿Olvidaste tu contraseña?</span>
          </p>
        </form>

        {authState.successMessage && <div style={styles.successBox}>🛡️ {authState.successMessage}</div>}
        {authState.errorMessage && <div style={styles.errorBox}>⚠️ {authState.errorMessage}</div>}
      </div>
    </div>
  );
};

const styles = {
  // Nuevo contenedor que cubre toda la pantalla con un degradado elegante y sobrio
  pageBackground: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box'
  },
  // Tarjeta de cristal optimizada con bordes marcados para máxima legibilidad
  glassCard: { 
    width: '100%',
    maxWidth: '420px', 
    padding: '45px 35px', 
    borderRadius: '24px', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    backdropFilter: 'blur(20px)', 
    WebkitBackdropFilter: 'blur(20px)', 
    border: '1px solid rgba(255, 255, 255, 0.12)', 
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)', 
    textAlign: 'center', 
    boxSizing: 'border-box',
  },
  title: { 
    color: '#ffffff', // Blanco puro
    fontSize: '28px', 
    margin: '0 0 35px 0', 
    fontWeight: '700', 
    fontFamily: 'system-ui, sans-serif', 
    letterSpacing: '0.5px' 
  },
  form: { display: 'flex', flexDirection: 'column' },
  // Caja de texto con fondo oscuro sutil para que las letras resalten perfectamente
  inputGroup: { 
    position: 'relative', 
    marginBottom: '24px', 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    display: 'flex', 
    alignItems: 'center',
    padding: '0 15px',
    transition: 'border 0.3s ease'
  },
  input: { 
    width: '100%', 
    padding: '14px 10px 14px 10px', 
    backgroundColor: 'transparent', 
    border: 'none', 
    outline: 'none', 
    color: '#ffffff', // Letras del input blancas y legibles
    fontSize: '15px', 
    fontFamily: 'system-ui, sans-serif', 
    boxSizing: 'border-box' 
  },
  inputIcon: { 
    color: '#ffffff', 
    fontSize: '16px', 
    opacity: 0.7 
  },
  utilitiesRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '25px' },
  rememberMe: { 
    color: '#e2e8f0', // Gris claro de alta visibilidad
    fontSize: '14px', 
    fontFamily: 'system-ui, sans-serif', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    cursor: 'pointer' 
  },
  checkbox: { accentColor: '#38bdf8', cursor: 'pointer' },
  buttonContainer: { width: '100%', marginTop: '5px' },
  forgotPrompt: { 
    fontSize: '14px', 
    marginTop: '25px', 
    marginBottom: 0, 
    fontFamily: 'system-ui, sans-serif' 
  },
  forgotLink: { 
    color: '#38bdf8', // Color azul cyan elegante que invita al click
    fontWeight: '500', 
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    textDecoration: 'none'
  },
  successBox: { color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '12px', borderRadius: '10px', marginTop: '20px', fontSize: '14px', fontFamily: 'system-ui, sans-serif' },
  errorBox: { color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '12px', borderRadius: '10px', marginTop: '20px', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }
};