import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Welcome } from "./components/Welcome";
import Login from "./components/Login";
import DashboardInicio from "./components/DashboardInicio";
import EmpleadoDashboard from "./components/EmpleadoDashboard";
import ProtectedRoute from "./router/ProtectedRoute";

// ── Animación solo para Welcome y Login (pantallas de entrada) ────────────────
function AuthPageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

// ── Las rutas de dashboard NO tienen animación de página completa ─────────────
// El cambio entre secciones se siente instantáneo porque solo
// cambia el contenido interno del layout, no desmonta todo el árbol.

// ── Página de Bienvenida ──────────────────────────────────────────────────────
function WelcomePage() {
  const navigate = useNavigate();
  return <Welcome onStartLogin={() => navigate("/login")} />;
}

// ── Dashboard Admin (lee sección de URL) ─────────────────────────────────────
function AdminDashboardPage() {
  const { section } = useParams();
  const sectionMap = {
    dashboard: 'Inicio',
    sells:     'Ventas',
    inventory: 'Inventario',
    employers: 'Empleados',
  };
  const activeSection = sectionMap[section] ?? 'Inicio';
  return <DashboardInicio activeSection={activeSection} />;
}

// ── Dashboard Empleado (lee sección de URL) ───────────────────────────────────
function EmployeeDashboardPage() {
  const { section } = useParams();
  const sectionMap = {
    dashboard: 'Inicio',
    sells:     'Ventas',
    inventory: 'Inventario',
  };
  const activeSection = sectionMap[section] ?? 'Inicio';
  return <EmpleadoDashboard activeSection={activeSection} />;
}

// ── Árbol de rutas ────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();

  return (
    // AnimatePresence solo activo en rutas de auth (Welcome / Login)
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>

        {/* ── Rutas públicas con animación suave ──────────────────────────── */}
        <Route
          path="/"
          element={<AuthPageWrapper><WelcomePage /></AuthPageWrapper>}
        />
        <Route
          path="/login"
          element={<AuthPageWrapper><Login /></AuthPageWrapper>}
        />

        {/* ── Rutas de Administrador (sin PageWrapper — instantáneas) ─────── */}
        <Route
          path="/:tenant/admin/:section"
          element={
            <ProtectedRoute requiredType="admin">
              <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
                <AdminDashboardPage />
              </div>
            </ProtectedRoute>
          }
        />
        {/* Redirect a dashboard cuando se visita /:tenant/admin */}
        <Route
          path="/:tenant/admin"
          element={
            <ProtectedRoute requiredType="admin">
              <Navigate to="dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* ── Rutas de Empleado (sin PageWrapper — instantáneas) ───────────── */}
        <Route
          path="/:tenant/employee-:empId/:section"
          element={
            <ProtectedRoute requiredType="employee">
              <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
                <EmployeeDashboardPage />
              </div>
            </ProtectedRoute>
          }
        />
        {/* Redirect a dashboard cuando se visita /:tenant/employee-:empId */}
        <Route
          path="/:tenant/employee-:empId"
          element={
            <ProtectedRoute requiredType="employee">
              <Navigate to="dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;