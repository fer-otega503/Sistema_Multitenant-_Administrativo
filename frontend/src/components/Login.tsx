import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook de React Router para poder movernos entre páginas
import ShinyText from './ShinyText';
import { LightRays } from './LightRays'; 
import SpecularButton from './SpecularButton'; 
import PillNav from './PillNav/PillNav';

// Traemos las funciones que validan que el correo y contraseña cumplan las reglas de seguridad
import { containsEmojis, validateLoginPassword, validateEmail } from '../validation/security';

// Servicios para mandar la petición de login al backend y guardar la sesión/tokens
import { AuthService } from '../services/auth.service';
import { TokenService, UserSession } from '../utils/token';

// Ruta estática del logo que mostramos más adelante
const logoUrl = '/src/assets/react.svg';

// Tipo de dato para guardar los mensajes de error del formulario
interface FormErrors {
  email?: string | null;
  password?: string | null;
}

// Los dos tipos de roles permitidos en el sistema
type UserRole = 'Administrador' | 'Empleado';

export function Login() {
  // Hook para cambiar de vista (por ejemplo, regresar al inicio '/')
  const navigate = useNavigate();

  // --- ESTADOS LOCALES ---
  // Guarda si entramos como Administrador o Empleado
  const [role, setRole] = useState<UserRole>('Administrador');
  
  // Guarda lo que el usuario va escribiendo en los inputs
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  
  // Guarda los mensajes de error si falla la validación
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Controla si ya se inició sesión con éxito para cambiar de pantalla
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Para mostrar estado de "Autenticando..." mientras responde el servidor
  const [isLoading, setIsLoading] = useState(false);
  
  // Guarda los datos del usuario que nos regresa la API (nombre, empresa, etc.)
  const [userData, setUserData] = useState<UserSession | null>(null);

  // Controla qué pestaña está seleccionada en el menú del área de pruebas
  const [activeTab, setActiveTab] = useState('#home');

  // Guarda el estado del backend de Python (Analytics) para demostrar la integración
  const [analyticsStatus, setAnalyticsStatus] = useState<any>(null);

  useEffect(() => {
    if (isSubmitted) {
      fetch('http://localhost:3000/api/analytics/status')
        .then(res => res.json())
        .then(data => setAnalyticsStatus(data))
        .catch(err => console.error("Error fetching analytics:", err));
    }
  }, [isSubmitted]);

  // Función sencilla para cambiar entre Admin y Empleado
  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  // Función que detecta cuando el usuario escribe en los inputs de correo o contraseña
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Bloqueamos los emojis en la contraseña desde que se van escribiendo
    if (name === 'password' && containsEmojis(value)) {
      setErrors(prev => ({ ...prev, password: "La contraseña no puede contener emojis." }));
      return; 
    }

    // Si escribe algo válido, limpiamos el error del campo
    setErrors(prev => ({ ...prev, [name]: null }));
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Función principal que procesa el inicio de sesión cuando le dan clic al botón
  const executeLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Evitamos que la página se recargue por defecto al enviar el form
    }
    
    const currentErrors: FormErrors = {};

    // Validamos la estructura del correo
    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.isValid) {
      currentErrors.email = emailValidation.message;
    }

    // Validamos las reglas de la contraseña (12 caracteres, sin emojis, etc.)
    const passwordValidation = validateLoginPassword(credentials.password);
    if (!passwordValidation.isValid) {
      currentErrors.password = passwordValidation.message;
    }

    // Si hay algún error en las validaciones, cortamos el proceso y los mostramos en pantalla
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    // Si todo está correcto, borramos errores viejos y activamos el loader
    setErrors({});
    setIsLoading(true);

    try {
      // Mandamos los datos al backend mediante el servicio de autenticación
      const response = await AuthService.login({
        email: credentials.email,
        password: credentials.password,
        role: role
      });

      console.log(`¡Ingreso exitoso! Empresa asociada: ${response.user.companyName} (${response.user.tenantId})`);
      
      // Guardamos la información que nos devolvió el backend y pasamos a la siguiente vista
      setUserData(response.user);
      setIsSubmitted(true);

    } catch (error: any) {
      // Si la API falla o los datos están mal, mostramos el mensaje de error recibido
      setErrors({
        email: error.message || 'Ocurrió un error al conectar con el servidor.'
      });
    } finally {
      setIsLoading(false); // Desactivamos la animación de carga sin importar qué pase
    }
  };

  // Función para cerrar la sesión y reiniciar todo al estado inicial
  const handleLogout = () => {
    TokenService.clearSession(); // Borra tokens guardados
    setIsSubmitted(false);
    setUserData(null);
    setCredentials({ email: '', password: '' });
  };

  // =========================================================================
  // 1. VISTA: SECCIÓN POST-LOGIN (Lo que se ve después de iniciar sesión)
  // =========================================================================
  if (isSubmitted) {
    const SafePillNav = PillNav as any;

    return (
      <main style={styles.whiteViewport}>
        {/* Barra de navegación superior con diseño estilo píldora */}
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
            baseColor="#e5e7eb"
            pillColor="#000000"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
            theme="light"
            initialLoadAnimation={true}
          />
        </header>

        {/* Mensaje de bienvenida tras autenticarse */}
        <div style={styles.whiteContent}>
          <h1 style={styles.whiteTitle}>Sección en desarrollo</h1>
          <p style={styles.whiteSubtitle}>
            Has iniciado sesión correctamente como <strong>{userData?.role || role}</strong>.
          </p>
          
          {/* Muestra la empresa/tenant detectada por el servidor */}
          {userData?.companyName && (
            <div style={styles.tenantBadge}>
              <span>Empresa: <strong>{userData.companyName}</strong></span>
              <small style={{ display: 'block', color: '#64748b' }}>ID Tenant: {userData.tenantId}</small>
            </div>
          )}

          {/* Muestra el estado del servicio de analítica (Python -> Node) */}
          {analyticsStatus && (
            <div style={{...styles.tenantBadge, borderColor: '#10b981'}}>
              <span style={{ color: '#047857' }}>Integración Python Activa ✅</span>
              <small style={{ display: 'block', color: '#64748b', marginTop: '4px' }}>
                Mensaje: {analyticsStatus.message} <br/>
                Servicio: {analyticsStatus.service}
              </small>
            </div>
          )}

          {/* Botón para salir y regresar al login */}
          <button 
            style={styles.whiteButton} 
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    );
  }

  // =========================================================================
  // 2. VISTA: FORMULARIO DE LOGIN PRINCIPAL
  // =========================================================================
  return (
    <main style={styles.appViewport}>
      {/* Botón para regresar a la página de bienvenida (Landing page) */}
      <button 
        onClick={() => navigate('/')} 
        style={styles.backButton}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver al Inicio
      </button>

      {/* Efecto visual de rayos de luz en el fondo */}
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

      {/* Tarjeta translúcida centrada con el formulario */}
      <div style={styles.interfaceLayer}>
        <form onSubmit={executeLogin} noValidate style={styles.glassCard}>
          
          {/* Título animado con brillo que cambia según el rol */}
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
          
          {/* Campo de texto: Correo Electrónico */}
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
              disabled={isLoading}
              required
              style={styles.inputInner}
            />
            {/* Mensaje de error de email si existe */}
            {errors.email && (
              <span style={styles.innerErrorText}>{errors.email}</span>
            )}
          </div>

          {/* Campo de texto: Contraseña */}
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
              disabled={isLoading}
              maxLength={12}
              required
              style={styles.inputInner}
            />
            {/* Mensaje de error de contraseña si existe */}
            {errors.password && (
              <span style={styles.innerErrorText}>{errors.password}</span>
            )}
          </div>

          {/* Texto de ayuda indicando las restricciones de la contraseña */}
          {!errors.password && (
            <div style={styles.helperContainer}>
              <small style={styles.helperText}>
                Debe tener exactamente 12 caracteres (Letras, números o símbolos). No se admiten emojis.
              </small>
            </div>
          )}

          {/* Botón personalizado de envío */}
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
              {isLoading ? 'Autenticando...' : 'Ingresar al Sistema'}
            </SpecularButton>
          </div>
        </form>
      </div>

      {/* --- SELECTOR FLOTANTE PARA CAMBIAR DE ROL (ADMIN / EMPLEADO) --- */}
      <div style={styles.roleSelectorContainer}>
        {/* Fondo azul deslizante con animación suave */}
        <div 
          style={{
            ...styles.slidingBackground,
            transform: role === 'Empleado' ? 'translateY(52px)' : 'translateY(0px)'
          }}
        />

        {/* Opción 1: Administrador */}
        <div 
          style={{
            ...styles.roleOption,
            color: role === 'Administrador' ? '#ffffff' : '#52525b'
          }}
          onClick={() => changeRole('Administrador')}
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

        {/* Opción 2: Empleado */}
        <div 
          style={{
            ...styles.roleOption,
            color: role === 'Empleado' ? '#ffffff' : '#52525b'
          }}
          onClick={() => changeRole('Empleado')}
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

// =========================================================================
// OBJETOS DE ESTILOS CSS EN JS
// =========================================================================
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
  // Estilo del botón "Volver al Inicio" de la esquina superior izquierda
  backButton: {
    position: 'absolute' as 'absolute',
    top: '30px',
    left: '30px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 50,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
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
  
  // Estilos del menú flotante selector de rol (Admin / Empleado)
  roleSelectorContainer: {
    position: 'fixed' as 'fixed',
    bottom: '40px', 
    left: '40px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    zIndex: 1000, 
    backgroundColor: 'rgba(9, 11, 18, 0.9)', 
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.04)', 
    padding: '8px',
    borderRadius: '26px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    width: '210px',
    boxSizing: 'border-box' as 'border-box',
    pointerEvents: 'auto' as 'auto'
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
    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', 
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
    userSelect: 'none' as 'none',
    pointerEvents: 'auto' as 'auto'
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

  // Estilos de la vista clara post-login
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
    margin: '0 0 0.5rem 0'
  },
  tenantBadge: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
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