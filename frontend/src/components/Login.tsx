import { useState } from 'react';
import { LightRays } from './LightRays'; 
import SpecularButton from './SpecularButton'; 
// Importamos nuestros helpers de validación y seguridad
import { containsEmojis, validateLoginPassword } from '../validation/security';

export function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validación inmediata en tiempo real (evita que se escriban emojis)
    if (name === 'password' && containsEmojis(value)) {
      setError("La contraseña no puede contener emojis.");
      return; // Bloquea la actualización del estado si detecta un emoji
    }

    setError(null); 
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const executeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ejecutamos la validación modular de contraseña
    const validation = validateLoginPassword(credentials.password);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setError(null);
    
    // --- ENVÍO SEGURO AL BACKEND ---
    console.log("Validaciones superadas con éxito. Enviando credenciales...");
    // Aquí puedes meter tu llamada Axios / Fetch de forma limpia
  };

  return (
    <main style={styles.appViewport}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={0.8}
        lightSpread={0.6}
        rayLength={3.5}
        followMouse={true}
        mouseInfluence={0.08}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        fadeDistance={1.2}
        saturation={1}
      />

      <div style={styles.interfaceLayer}>
        <form onSubmit={executeLogin} style={styles.glassCard}>
          <h2 style={styles.title}>Iniciar Sesión</h2>
          
          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}
          
          <div style={styles.inputGroup}>
            <input 
              name="email"
              type="email" 
              placeholder="Correo electrónico" 
              value={credentials.email}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input 
              name="password"
              type="password" 
              placeholder="Contraseña (12 caracteres)" 
              value={credentials.password}
              onChange={handleInputChange}
              maxLength={12} // Restricción física en el DOM
              required
              style={styles.input}
            />
            <small style={styles.helperText}>
              Debe tener exactamente 12 caracteres (Letras, números o símbolos). No se admiten emojis.
            </small>
          </div>

          <div style={styles.utilityRow}>
            <a href="#forgot" style={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
          </div>

          <div style={styles.buttonContainer}>
            <SpecularButton
              size="lg"
              baseColor="rgba(15, 23, 42, 0.4)"
              lineColor="#3b82f6"
              textColor="#ffffff"
              shineSize={14}
              intensity={1.4}
              onClick={() => {}} 
            >
              Ingresar al Sistema
            </SpecularButton>
          </div>
        </form>
      </div>
    </main>
  );
}

// Estilos de UI
const styles = {
  appViewport: {
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    position: 'relative' as 'relative',
    backgroundColor: '#0a0d16',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  interfaceLayer: {
    position: 'relative' as 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '440px',
    padding: '20px',
    boxSizing: 'border-box' as 'border-box'
  },
  glassCard: {
    width: '100%',
    padding: '3rem 2.5rem',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    boxSizing: 'border-box' as 'border-box'
  },
  title: {
    color: '#ffffff',
    fontSize: '2rem',
    marginBottom: '2rem',
    fontWeight: '600',
    textAlign: 'center' as 'center',
    letterSpacing: '-0.5px'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fca5a5',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    fontSize: '0.85rem',
    textAlign: 'center' as 'center'
  },
  inputGroup: {
    marginBottom: '1.25rem'
  },
  input: {
    width: '100%',
    padding: '1.1rem 1.2rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: '#ffffff',
    fontSize: '1rem',
    boxSizing: 'border-box' as 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  helperText: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: '0.4rem',
    paddingLeft: '4px',
    lineHeight: '1.2'
  },
  utilityRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
    fontSize: '0.9rem'
  },
  forgotLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500'
  },
  buttonContainer: {
    marginTop: '2rem',
    marginBottom: '1rem'
  }
};

export default Login;