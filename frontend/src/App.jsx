import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // Animaciones de entrada y salida
import { Welcome } from "./components/Welcome";
import Login from "./components/Login";

// Componente auxiliar para conectar el botón de inicio con React Router
function WelcomePage() {
  const navigate = useNavigate();
  return <Welcome onStartLogin={() => navigate("/login")} />;
}

// Envoltorio reutilizable para animar el cambio entre páginas
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}  // Estado inicial antes de aparecer
      animate={{ opacity: 1, scale: 1, y: 0 }}      // Estado cuando ya es visible
      exit={{ opacity: 0, scale: 0.98, y: -10 }}    // Estado al desaparecer
      transition={{ 
        duration: 0.35, 
        ease: [0.22, 1, 0.36, 1] // Transición suave estilo iOS
      }}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

// Maneja las rutas con animación activada
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Ruta de bienvenida */}
        <Route 
          path="/" 
          element={
            <PageWrapper>
              <WelcomePage />
            </PageWrapper>
          } 
        />

        {/* Ruta de Login */}
        <Route 
          path="/login" 
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;