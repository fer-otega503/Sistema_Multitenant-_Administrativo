import React, { useState } from 'react';
import { LightRays } from './LightRays';
import ShinyText from './ShinyText';
import SpecularButton from './SpecularButton';

interface WelcomeProps {
  onStartLogin: () => void;
}

export function Welcome({ onStartLogin }: WelcomeProps) {
  // Estado para controlar la pestaña activa (Inicio, Nosotros, Contacto)
  const [activeTab, setActiveTab] = useState<'inicio' | 'nosotros' | 'contacto'>('inicio');

  return (
    <main style={styles.viewport}>
      {/* Fondo interactivo */}
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

      {/* NAVBAR SUPERIOR */}
      <header style={styles.header}>
        <div /> {/* Espaciador para mantener los enlaces a la derecha */}
        
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('inicio')}
            style={{
              ...styles.navLink,
              color: activeTab === 'inicio' ? '#ffffff' : '#94a3b8',
              borderBottom: activeTab === 'inicio' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            Inicio
          </button>

          <button
            onClick={() => setActiveTab('nosotros')}
            style={{
              ...styles.navLink,
              color: activeTab === 'nosotros' ? '#ffffff' : '#94a3b8',
              borderBottom: activeTab === 'nosotros' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            Nosotros
          </button>

          <button
            onClick={() => setActiveTab('contacto')}
            style={{
              ...styles.navLink,
              color: activeTab === 'contacto' ? '#ffffff' : '#94a3b8',
              borderBottom: activeTab === 'contacto' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            Contacto
          </button>
        </nav>
      </header>

      {/* CONTENIDO DINÁMICO SEGÚN LA SECCIÓN */}
      <div style={styles.content}>
        
        {/* === VISTA: INICIO === */}
        {activeTab === 'inicio' && (
          <div style={styles.tabContainer}>
            <h1 style={styles.title}>
              <ShinyText
                text="WELCOME"
                speed={3}
                color="#ffffff"
                shineColor="#3b82f6"
                spread={100}
              />
            </h1>

            <p style={styles.description}>
              Accede a la plataforma de gestión integral diseñada para optimizar tus procesos empresariales con máxima seguridad.
            </p>

            <div style={styles.question}>
              ¿Listo para <span style={{ color: '#3b82f6', fontWeight: '600' }}>comenzar?</span>
            </div>

            <div style={styles.buttonGroup}>
              <button style={styles.primaryButton} onClick={onStartLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Iniciar Sesión
              </button>

              <SpecularButton
                size="lg"
                baseColor="rgba(15, 23, 42, 0.4)"
                lineColor="rgba(255, 255, 255, 0.2)"
                textColor="#ffffff"
                shineSize={12}
                intensity={1}
                onClick={() => setActiveTab('nosotros')}
              >
                Conocer Más →
              </SpecularButton>
            </div>

            <small style={styles.subtext}>Accede al sistema según tu rol asignado.</small>
          </div>
        )}

        {/* === VISTA: NOSOTROS === */}
        {activeTab === 'nosotros' && (
          <div style={styles.tabContainer}>
            <h2 style={styles.sectionTitle}>Sobre Nosotros</h2>
            <p style={styles.sectionDescription}>
              Somos un equipo de trabajo dedicado a la creación de sitios web optimizados y de alta calidad, con la finalidad de cumplir las necesidades del cliente.
            </p>
            <div style={{ marginTop: '20px' }}>
              <button style={styles.secondaryButton} onClick={() => setActiveTab('inicio')}>
                ← Volver al Inicio
              </button>
            </div>
          </div>
        )}

        {/* === VISTA: CONTACTO === */}
        {activeTab === 'contacto' && (
          <div style={styles.tabContainer}>
            <h2 style={styles.sectionTitle}>Contacto y Soporte</h2>
            <p style={{ ...styles.description, marginBottom: '24px' }}>
              ¿Tienes alguna inquietud o consulta sobre la plataforma? Contáctanos directamente:
            </p>

            <div style={styles.contactCard}>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>💻 Equipo de Desarrollo:</span>
                <span style={styles.contactValue}>Dev Team Services</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>✉️ Correo Electrónico:</span>
                <a href="mailto:soporte@desarrolladores.com" style={styles.contactEmail}>
                  soporte@desarrolladores.com
                </a>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button style={styles.secondaryButton} onClick={() => setActiveTab('inicio')}>
                ← Volver al Inicio
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Espaciador inferior para mantener centrado vertical */}
      <div style={{ height: '20px' }} />
    </main>
  );
}

const styles = {
  viewport: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0d16',
    position: 'relative' as 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '30px 60px',
    boxSizing: 'border-box' as 'border-box',
  },
  header: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    background: 'none',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    paddingBottom: '4px',
    cursor: 'pointer',
    transition: 'color 0.2s, border-bottom 0.2s',
  },
  content: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    textAlign: 'center' as 'center',
    maxWidth: '650px',
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  title: {
    fontSize: '4.5rem',
    fontWeight: '800',
    margin: '0 0 16px 0',
    letterSpacing: '2px',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 16px 0',
  },
  sectionDescription: {
    color: '#cbd5e1',
    fontSize: '1.1rem',
    lineHeight: '1.7',
    maxWidth: '550px',
  },
  description: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 28px 0',
  },
  question: {
    color: '#ffffff',
    fontSize: '1.1rem',
    marginBottom: '24px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '30px',
    padding: '14px 28px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '10px 20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  contactCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  contactLabel: {
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  contactValue: {
    color: '#ffffff',
    fontWeight: '600',
  },
  contactEmail: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },
  subtext: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
};