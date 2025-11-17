/*import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import HomePage from './pages/HomePage';
import OrdinaPage from './pages/OrdinaPage';
import OperatorePage from './pages/OperatorePage';
import GestioneMenuPage from './pages/GestioneMenuPage';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 10, background: '#eee' }}>
        <Link to="/">Home</Link> |{' '}
        {/*<Link to="/operatore">Area Operatore</Link>
         <Link to="/gestione-menu">Gestione Menu'</Link>
      //</nav>

      /*<Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ordina" element={<OrdinaPage />} />
        <Route path="/operatore" element={<OperatorePage />} />
         <Route path="/gestione-menu" element={<GestioneMenuPage />} /> 
        <Route path="*" element={<p>Pagina non trovata</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;*/





import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import OrdinaPage from './pages/OrdinaPage';
import OperatorePage from './pages/OperatorePage';
import GestioneMenuPage from './pages/GestioneMenuPage';
import LicenseModal from './components/LicenseModal';


function App() {
  const location = useLocation();
  const mostraNavbar = !location.pathname.startsWith('/ordina');

  return (
    <>
   
     <LicenseModal />

      {mostraNavbar && (
        <nav style={{ padding: 10, background: '#eee' }}>
          <Link to="/">Home</Link> |{' '}
          <Link to="/operatore">Area Operatore</Link> |{' '}
          <Link to="/gestione-menu">Gestione Menu'</Link>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ordina" element={<OrdinaPage />} />
        <Route path="/operatore" element={<OperatorePage />} />
        <Route path="/gestione-menu" element={<GestioneMenuPage />} />
        <Route path="*" element={<p>Pagina non trovata</p>} />
      </Routes>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;


