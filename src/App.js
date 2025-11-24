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





/*import React from 'react';
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

*/





import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import OrdinaPage from './pages/OrdinaPage';
import OperatorePage from './pages/OperatorePage';
import GestioneMenuPage from './pages/GestioneMenuPage';
import LicenseModal from './components/LicenseModal';
import SecurityModal from './components/SecurityModal';

function App() {
  const location = useLocation();
  const mostraNavbar = !location.pathname.startsWith('/ordina');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ✅ DEFINISCO LE PAGINE PROTETTE
  const PAGINE_PROTETTE = ['/', '/operatore', '/gestione-menu'];
  const paginaCorrenteProtetta = PAGINE_PROTETTE.includes(location.pathname);

  // ✅ VERIFICA SICUREZZA SOLO ALL'AVVIO - NESSUN CONTROLLO DI INATTIVITÀ
  useEffect(() => {
    console.log('🔄 Verifica sicurezza...');
    
    const ultimoAccesso = localStorage.getItem('ultimoAccesso');
    
    // ✅ SEMPLICE: SE NON C'È ULTIMO ACCESSO, MOSTRA MODAL
    if (!ultimoAccesso) {
      console.log('🔐 Primo accesso - mostra modal');
      setShowSecurityModal(true);
      setIsAuthorized(false);
    } else {
      // ✅ ACCESSO AUTOMATICO SE C'È ULTIMO ACCESSO - NESSUN CONTROLLO TIMEOUT
      console.log('✅ Accesso autorizzato (nessun controllo timeout)');
      setIsAuthorized(true);
      setShowSecurityModal(false);
    }
  }, []); // ✅ SOLO ALL'AVVIO

  // ✅ SUCCESSO AUTENTICAZIONE
  const handleAuthSuccess = () => {
    console.log('🎉 Autenticazione riuscita!');
    setIsAuthorized(true);
    setShowSecurityModal(false);
    localStorage.setItem('ultimoAccesso', new Date().toISOString());
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    console.log('🚪 Logout - cancello tutto');
    localStorage.removeItem('ultimoAccesso');
    setIsAuthorized(false);
    setShowSecurityModal(true);
  };

  // ✅ SE NON AUTORIZZATO SU PAGINA PROTETTA, MOSTRA SOLO SECURITY MODAL
  if (paginaCorrenteProtetta && !isAuthorized) {
    return (
      <>
        <LicenseModal />
        <SecurityModal 
          isOpen={showSecurityModal} 
          onSuccess={handleAuthSuccess} 
        />
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          background: '#fff3cd',
          border: '1px solid #ffeaa7'
        }}>
          <h3>🔐 Accesso Richiesto</h3>
          <p>Inserisci il codice di sicurezza per continuare</p>
        </div>
      </>
    );
  }

  // ✅ APP NORMALE SE AUTORIZZATO
  return (
    <>
      <LicenseModal />

      {mostraNavbar && (
        <nav style={{ 
          padding: 10, 
          background: '#0e0e0eff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px'
          }}>
            <Link 
              to="/" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/' ? '#007bff' : '#f3f5f7ff',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                fontSize: '16px'
              }}
            >
              Home
            </Link>
            <span style={{ color: '#f9f3f3ff' }}>|</span>
            <Link 
              to="/operatore" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/operatore' ? '#007bff' : '#f5f7f9ff',
                fontWeight: location.pathname === '/operatore' ? 'bold' : 'normal',
                fontSize: '16px'
              }}
            >
              Area Operatore
            </Link>
            <span style={{ color: '#dee2e6' }}>|</span>
            <Link 
              to="/gestione-menu" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/gestione-menu' ? '#007bff' : '#f3f5f7ff',
                fontWeight: location.pathname === '/gestione-menu' ? 'bold' : 'normal',
                fontSize: '16px'
              }}
            >
              Gestione Menu
            </Link>
          </div>
          
          {/* ✅ TASTO LOGOUT */}
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: 'auto'
            }}
          >
            🚪 Logout
          </button>
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
