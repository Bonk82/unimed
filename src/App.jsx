import { Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import NavBar from "./components/NavBar";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Reserva from "./components/Reserva";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
// import jwt from 'jsonwebtoken'
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/vela-green/theme.css";
import 'primeflex/primeflex.css';                                   // css utility
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const conex = localStorage.getItem("conex");
    // if(conex) {
    //   const data = jwt.decode(conex)
    //   console.log('contendio token',data);
    // }
    if(!conex) navigate("/login");
  }, [navigate]);

  return (
    <AuthProvider>
      <PrimeReactProvider value={{}}>
        <NavBar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/reserva" element={<Reserva />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </PrimeReactProvider>
    </AuthProvider>
  )
}

export default App
