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





/*import React, { useState, useEffect } from 'react';
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

  // ✅ VERIFICA SICUREZZA SOLO ALL'AVVIO
  useEffect(() => {
    console.log('🔄 Verifica sicurezza...');
    
    const ultimoAccesso = localStorage.getItem('ultimoAccesso');
    
    if (!ultimoAccesso) {
      // ✅ PRIMO AVVIO - MOSTRA MODAL
      console.log('🔐 Primo avvio - mostra modal');
      setShowSecurityModal(true);
      setIsAuthorized(false);
    } else {
      // ✅ VERIFICA SE SONO PASSATI 15 MINUTI
      const dataAccesso = new Date(ultimoAccesso);
      const dataOra = new Date();
      const minutiTrascorsi = (dataOra - dataAccesso) / (1000 * 60);
      
      if (minutiTrascorsi > 15) {
        console.log('⌛ Sessione scaduta - mostra modal');
        setShowSecurityModal(true);
        setIsAuthorized(false);
      } else {
        console.log('✅ Sessione valida - accesso autorizzato');
        setIsAuthorized(true);
        setShowSecurityModal(false);
      }
    }
  }, []);

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
          padding: '15px 20px', 
          background: '#121213ff',
          borderBottom: '1px solid #0e0f0fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* ✅ LINK CENTRATI *//*}
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
                color: location.pathname === '/' ? '#007bff' : '#f0f0f8ff',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                fontSize: '16px'
              }}
            >
              Home
            </Link>
            <span style={{ color: '#dee2e6' }}>|</span>
            <Link 
              to="/operatore" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/operatore' ? '#007bff' : '#eef3f3ff',
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
                color: location.pathname === '/gestione-menu' ? '#007bff' : '#f1f6f6ff',
                fontWeight: location.pathname === '/gestione-menu' ? 'bold' : 'normal',
                fontSize: '16px'
              }}
            >
              Gestione Menu
            </Link>
          </div>
          
          {/* ✅ TASTO LOGOUT A DESTRA *//*}
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
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



*/




/*import React, { useState, useEffect } from 'react';
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
          
          {/* ✅ TASTO LOGOUT *//*}
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

*/


















/*import React, { useState, useEffect } from 'react';
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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '10px 20px',
          background: '#0e0e0eff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          borderBottom: '1px solid #333'
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <Link 
              to="/" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/' ? '#007bff' : '#f3f5f7ff',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                fontSize: '16px',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/') {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              Home
            </Link>
            <span style={{ color: '#f9f3f3ff', opacity: 0.5 }}>|</span>
            <Link 
              to="/operatore" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/operatore' ? '#007bff' : '#f5f7f9ff',
                fontWeight: location.pathname === '/operatore' ? 'bold' : 'normal',
                fontSize: '16px',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/operatore') {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/operatore') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              Area Operatore
            </Link>
            <span style={{ color: '#dee2e6', opacity: 0.5 }}>|</span>
            <Link 
              to="/gestione-menu" 
              style={{
                textDecoration: 'none',
                color: location.pathname === '/gestione-menu' ? '#007bff' : '#f3f5f7ff',
                fontWeight: location.pathname === '/gestione-menu' ? 'bold' : 'normal',
                fontSize: '16px',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/gestione-menu') {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/gestione-menu') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              Gestione Menu
            </Link>
          </div>
          
          {/* ✅ TASTO LOGOUT *//*}
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: 'auto',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c82333';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dc3545';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚪 Logout
          </button>
        </nav>
      )}

      {/* ✅ CONTENUTO PRINCIPALE CON MARGINE SUPERIORE *//*}
      <div style={{
        marginTop: mostraNavbar ? '60px' : '0',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ordina" element={<OrdinaPage />} />
          <Route path="/operatore" element={<OperatorePage />} />
          <Route path="/gestione-menu" element={<GestioneMenuPage />} />
          <Route path="*" element={<p>Pagina non trovata</p>} />
        </Routes>
      </div>
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









import React, { useState, useEffect, useRef } from 'react';
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const passwordRef = useRef(null);
  
  // ✅ PASSWORD - CAMBIA QUESTA!
  const SITE_PASSWORD = 'service'; // ← MODIFICA QUESTA PASSWORD

  // ✅ VERIFICA AUTENTICAZIONE SOLO UNA VOLTA
  useEffect(() => {
    console.log('🔐 Controllo autenticazione...');
    
    const authData = localStorage.getItem('restaurant_auth');
    const authTimestamp = localStorage.getItem('auth_timestamp');
    
    if (authData && authTimestamp) {
      const authTime = new Date(authTimestamp);
      const now = new Date();
      const hoursDiff = Math.abs(now - authTime) / 36e5;
      
      if (hoursDiff < 24) {
        console.log('✅ Autenticazione valida');
        setIsAuthorized(true);
      } else {
        console.log('⏰ Autenticazione scaduta');
        localStorage.removeItem('restaurant_auth');
        localStorage.removeItem('auth_timestamp');
      }
    }
    
    setCheckingAuth(false);
  }, []);

  // ✅ SUCCESSO AUTENTICAZIONE
  const handleAuthSuccess = () => {
    console.log('🎉 Autenticazione riuscita!');
    setIsAuthorized(true);
    localStorage.setItem('restaurant_auth', 'true');
    localStorage.setItem('auth_timestamp', new Date().toISOString());
  };

  // ✅ VERIFICA PASSWORD IN TEMPO REALE
  const checkPasswordRealTime = (password) => {
    if (password === SITE_PASSWORD) {
      handleAuthSuccess();
    }
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    console.log('🚪 Logout');
    localStorage.removeItem('restaurant_auth');
    localStorage.removeItem('auth_timestamp');
    localStorage.removeItem('ultimoAccesso');
    setIsAuthorized(false);
  };

  // ✅ FOCUS SULL'INPUT AL CARICAMENTO
  useEffect(() => {
    if (!isAuthorized && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [isAuthorized]);

  // ✅ SE STIAMO CONTROLLANDO L'AUTENTICAZIONE, MOSTRA LOADING
  if (checkingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Verifica sicurezza...</h2>
        </div>
      </div>
    );
  }

  // ✅ SE NON AUTORIZZATO, MOSTRA SOLO IL SECURITY MODAL
  if (!isAuthorized) {
    return (
      <>
        <LicenseModal />
        
        {/* ✅ MODAL DI SICUREZZA */}
        <div className="security-modal-overlay">
          <div className="security-modal">
            <div className="modal-header">
              <h2 className="modal-title">🔐 Accesso Riservato</h2>
             
            </div>
            
            <div className="modal-body">
              <p className="modal-message">
                Questo sistema è accessibile solo al personale autorizzato.
                <br />
                Per continuare, inserisci il codice di sicurezza:
              </p>
              
              <div className="password-form">
                <input
                  ref={passwordRef}
                  type="password"
                  id="password-input"
                  placeholder="Codice di accesso"
                  className="password-input"
                  autoFocus
                  required
                  onChange={(e) => checkPasswordRealTime(e.target.value)}
                />
                
                <div className="password-hint">
                  <small>Inserisci il codice - l'accesso è automatico</small>
                </div>
              </div>
              
              <div className="modal-info">
                <p className="info-text">
                  <small>
                    L'autenticazione è valida per 24 ore.
                    <br />
                    Accesso vietato a personale non autorizzato.
                  </small>
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <p className="footer-text">
                Sistema protetto - v1.0
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ✅ APP NORMALE SE AUTORIZZATO
  return (
    <>
      <LicenseModal />

      {mostraNavbar && (
        <nav className="main-navbar">
          <div className="navbar-center">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <span className="nav-separator">|</span>
            <Link 
              to="/operatore" 
              className={`nav-link ${location.pathname === '/operatore' ? 'active' : ''}`}
            >
              Area Operatore
            </Link>
            <span className="nav-separator">|</span>
            <Link 
              to="/gestione-menu" 
              className={`nav-link ${location.pathname === '/gestione-menu' ? 'active' : ''}`}
            >
              Gestione Menu
            </Link>
            <span className="nav-separator">|</span>
            
           {/* <Link 
              to="/ordina" 
              className={`nav-link ${location.pathname === '/ordina' ? 'active' : ''}`}
            >
              Pagina Ordini
            </Link>*/}

          </div>
          
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            🚪 Logout
          </button>
        </nav>
      )}

      <div className={`main-content ${mostraNavbar ? 'with-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ordina" element={<OrdinaPage />} />
          <Route path="/operatore" element={<OperatorePage />} />
          <Route path="/gestione-menu" element={<GestioneMenuPage />} />
          <Route path="*" element={<p>Pagina non trovata</p>} />
        </Routes>
      </div>
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