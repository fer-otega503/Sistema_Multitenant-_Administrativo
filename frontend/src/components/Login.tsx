import { useState } from 'react';
import ShinyText from './ShinyText';
import { LightRays } from './LightRays'; 
import SpecularButton from './SpecularButton'; 
// Dado que PillNav está en una subcarpeta, entramos a ./PillNav/PillNav
import PillNav from './PillNav/PillNav';
// Para el archivo de validación, subimos un nivel y entramos a validation
import { containsEmojis, validateLoginPassword, validateEmail } from '../validation/security';

// Definimos el logo usando una ruta estática directa
const logoUrl = '/src/assets/react.svg';

interface FormErrors {
  email?: string | null;
  password?: string | null;
}

type UserRole = 'Administrador' | 'Empleado';

export function Login() {
  const [role, setRole] = useState<UserRole>('Administrador');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Estado para la pestaña activa en la navbar del área en desarrollo
  const [activeTab, setActiveTab] = useState('#home');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'password' && containsEmojis(value)) {
      setErrors(prev => ({ ...prev, password: "La contraseña no puede contener emojis." }));
      return; 
    }

    setErrors(prev => ({ ...prev, [name]: null }));
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const executeLogin = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const currentErrors: FormErrors = {};

    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      currentErrors.email = emailValidation.message;
    }

    const passwordValidation = validateLoginPassword(credentials.password);
    if (!passwordValidation.isValid) {
      currentErrors.password = passwordValidation.message;
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors({});
    console.log(`¡Ingreso exitoso como ${role}! Credenciales:`, credentials);
    setIsSubmitted(true);
  };

  // --- VISTA "SECCIÓN EN DESARROLLO" (LIENZO BLANCO CON REJILLA Y PILLNAV) ---
  if (isSubmitted) {
    const SafePillNav = PillNav as any;

    return (
      <main style={styles.whiteViewport}>
        {/* Encabezado que aloja e integra tu PillNav con los colores exactos de tu captura */}
        <header style={styles.navHeader}>
          <SafePillNav
            logo={logoUrl}
            logoAlt="Logo de la Empresa"
            items={[
              { label: 'HOME', href: '#home', onClick: () => setActiveTab('#home') },
              { label: 'ABOUT', href: '#about', onClick: () => setActiveTab('#about') },
              { label: 'CONTACT', href: '#contact', onClick: () => setActiveTab('#contact') }
            ]}
            activeHref={activeTab}
            className="custom-nav"
            ease="power3.easeOut"
            baseColor="#e5e7eb"            // Botones inactivos gris claro
            pillColor="#000000"            // Óvalo activo deslizante en negro
            hoveredPillTextColor="#ffffff" // Texto activo/hover en blanco
            pillTextColor="#000000"        // Texto inactivo en negro
            theme="light"
            initialLoadAnimation={true}
          />
        </header>

        {/* Contenedor central con el diseño limpio de desarrollo */}
        <div style={styles.whiteContent}>
          <h1 style={styles.whiteTitle}>Sección en desarrollo</h1>
          <p style={styles.whiteSubtitle}>
            Has iniciado sesión correctamente como <strong>{role}</strong>.
          </p>
          <button 
            style={styles.whiteButton} 
            onClick={() => { setIsSubmitted(false); setCredentials({ email: '', password: '' }); }}
          >
            Regresar al Login
          </button>
        </div>
      </main>
    );
  }

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

      {/* CONTENEDOR CENTRAL DEL LOGIN */}
      <div style={styles.interfaceLayer}>
        <form onSubmit={executeLogin} noValidate style={styles.glassCard}>
          
          <div style={styles.title}>
            <ShinyText
              key={role} 
              text={`Iniciar Sesión ${role}`}
              speed={2.5}
              delay={0}
              color="#94a3b8"       
              shineColor="#ffffff"   
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </div>
          
          {/* CONTENEDOR DE CORREO ELECTRÓNICO */}
          <div 
            style={{
              ...styles.inputContainer,
              borderColor: errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              boxShadow: errors.email ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
            }}
          >
            <input 
              name="email"
              type="text" 
              placeholder="Correo electrónico" 
              value={credentials.email}
              onChange={handleInputChange}
              required
              style={styles.inputInner}
            />
            {errors.email && (
              <span style={styles.innerErrorText}>{errors.email}</span>
            )}
          </div>

          {/* CONTENEDOR DE CONTRASEÑA */}
          <div 
            style={{
              ...styles.inputContainer,
              borderColor: errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              boxShadow: errors.password ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
            }}
          >
            <input 
              name="password"
              type="password" 
              placeholder="Contraseña" 
              value={credentials.password}
              onChange={handleInputChange}
              maxLength={12}
              required
              style={styles.inputInner}
            />
            {errors.password && (
              <span style={styles.innerErrorText}>{errors.password}</span>
            )}
          </div>

          {!errors.password && (
            <div style={styles.helperContainer}>
              <small style={styles.helperText}>
                Debe tener exactamente 12 caracteres (Letras, números o símbolos). No se admiten emojis.
              </small>
            </div>
          )}

          <div style={styles.buttonContainer}>
            <SpecularButton
              size="lg"
              baseColor="rgba(15, 23, 42, 0.4)"
              lineColor="#3b82f6"
              textColor="#ffffff"
              shineSize={14}
              intensity={1.4}
              onClick={() => executeLogin()}
            >
              Ingresar al Sistema
            </SpecularButton>
          </div>
        </form>
      </div>

      {/* --- SELECTOR VERTICAL DE ROL INTEGRADO --- */}
      <div style={styles.roleSelectorContainer}>
        {/* Burbuja activa deslizante perfectamente centrada */}
        <div 
          style={{
            ...styles.slidingBackground,
            transform: role === 'Empleado' ? 'translateY(52px)' : 'translateY(0px)'
          }}
        />

        {/* Opción Administrador */}
        <div 
          style={{
            ...styles.roleOption,
            color: role === 'Administrador' ? '#ffffff' : '#52525b'
          }}
          onClick={() => setRole('Administrador')}
        >
          <div style={{
            ...styles.avatarIcon,
            borderColor: role === 'Administrador' ? '#1d4ed8' : 'rgba(255, 255, 255, 0.08)',
            backgroundColor: role === 'Administrador' ? 'rgba(29, 78, 216, 0.25)' : 'rgba(255, 255, 255, 0.03)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role === 'Administrador' ? '#3b82f6' : '#71717a'} strokeWidth="2" style={{ transition: 'all 0.25s' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span style={{
            ...styles.roleText,
            fontWeight: role === 'Administrador' ? '600' : '500'
          }}>Administrador</span>
        </div>

        {/* Opción Empleado */}
        <div 
          style={{
            ...styles.roleOption,
            color: role === 'Empleado' ? '#ffffff' : '#52525b'
          }}
          onClick={() => setRole('Empleado')}
        >
          <div style={{
            ...styles.avatarIcon,
            borderColor: role === 'Empleado' ? '#1d4ed8' : 'rgba(255, 255, 255, 0.08)',
            backgroundColor: role === 'Empleado' ? 'rgba(29, 78, 216, 0.25)' : 'rgba(255, 255, 255, 0.03)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role === 'Empleado' ? '#3b82f6' : '#71717a'} strokeWidth="2" style={{ transition: 'all 0.25s' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span style={{
            ...styles.roleText,
            fontWeight: role === 'Empleado' ? '600' : '500'
          }}>Empleado</span>
        </div>
      </div>
    </main>
  );
}

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
    fontSize: '1.75rem', 
    marginBottom: '2rem',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center' as 'center'
  },
  inputContainer: {
    position: 'relative' as 'relative',
    width: '100%',
    marginBottom: '1.25rem',
    borderRadius: '14px',
    border: '1.5px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: '0.8rem 1.1rem 0.6rem 1.1rem', 
    boxSizing: 'border-box' as 'border-box',
    display: 'flex',
    flexDirection: 'column' as 'column',
    transition: 'all 0.25s ease'
  },
  inputInner: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    padding: '0',
    boxSizing: 'border-box' as 'border-box',
  },
  innerErrorText: {
    alignSelf: 'flex-end',
    color: '#f87171', 
    fontSize: '0.72rem',
    fontWeight: '500',
    marginTop: '4px',
    pointerEvents: 'none' as 'none',
    width: '100%',
    textAlign: 'right' as 'right'
  },
  helperContainer: {
    marginBottom: '1.25rem',
    marginTop: '-0.75rem',
    paddingLeft: '4px'
  },
  helperText: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.75rem',
    lineHeight: '1.3'
  },
  buttonContainer: {
    marginTop: '1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  
  // SELECTOR CON ESTRUCTURA CORREGIDA
  roleSelectorContainer: {
    position: 'fixed' as 'fixed',
    bottom: '40px', 
    left: '40px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    zIndex: 50,
    backgroundColor: 'rgba(9, 11, 18, 0.9)', 
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.04)', 
    padding: '8px',
    borderRadius: '26px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    width: '210px',
    boxSizing: 'border-box' as 'border-box'
  },
  slidingBackground: {
    position: 'absolute' as 'absolute',
    top: '8px',
    left: '8px',
    width: '192px', 
    height: '44px', 
    borderRadius: '22px',
    backgroundColor: 'rgba(17, 34, 64, 0.65)', 
    border: '1px solid #1d4ed8',             
    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', // Efecto elástico "pop" al desplazarse
    pointerEvents: 'none' as 'none',
    zIndex: 1,
  },
  roleOption: {
    position: 'relative' as 'relative',
    zIndex: 2, 
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%', 
    height: '44px',
    padding: '0 12px',
    borderRadius: '22px',
    cursor: 'pointer',
    transition: 'color 0.25s ease',
    boxSizing: 'border-box' as 'border-box',
    userSelect: 'none' as 'none'
  },
  avatarIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid',
    transition: 'all 0.25s ease',
  },
  roleText: {
    fontSize: '0.88rem',
    letterSpacing: '0.2px',
    userSelect: 'none' as 'none',
    transition: 'color 0.25s ease'
  },

  // --- ESTILOS DE LA PANTALLA EN DESARROLLO (REJILLA Y NAV) ---
  whiteViewport: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f1f1f1',
    backgroundImage: 'radial-gradient(#bababa 1.2px, transparent 1.2px)',
    backgroundSize: '28px 28px', 
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    margin: 0,
    padding: 0,
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  navHeader: {
    position: 'absolute' as 'absolute',
    top: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
  },
  whiteContent: {
    textAlign: 'center' as 'center',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    gap: '0.8rem',
    zIndex: 10,
    marginTop: '80px',
  },
  whiteTitle: {
    color: '#120F17', 
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-1px',
  },
  whiteSubtitle: {
    color: '#555555',
    fontSize: '1rem',
    margin: '0 0 1.2rem 0'
  },
  whiteButton: {
    padding: '12px 24px',
    backgroundColor: '#120F17', 
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(18, 15, 23, 0.15)',
  }
};

export default Login;