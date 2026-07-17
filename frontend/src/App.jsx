/* frontend/src/App.jsx */
import { BrowserRouter } from "react-router-dom"; // ◄ Importamos el router
import Login from "./components/Login"; 

function App() {
  return (
    <BrowserRouter> {/* ◄ Envolvemos todo aquí */}
      <Login />
    </BrowserRouter>
  );
}

export default App;