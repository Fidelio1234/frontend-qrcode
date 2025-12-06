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



import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const passwordRef = useRef(null);
  const justLoggedOutRef = useRef(false);
  
  const SITE_PASSWORD = 'service';

  useEffect(() => {
    console.log('🔐 Controllo autenticazione...');
    
    // Controlla se appena logged out
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loggedout') === 'true') {
      console.log('🔄 Pagina caricata dopo logout');
      justLoggedOutRef.current = true;
      window.history.replaceState({}, '', '/');
      
      // Blocca autofill per 2 secondi
      setTimeout(() => {
        justLoggedOutRef.current = false;
      }, 2000);
    }
    
    // Verifica autenticazione esistente
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
  }, []);

  const handleAuthSuccess = useCallback(() => {
    console.log('🎉 Autenticazione riuscita!');
    setIsAuthorized(true);
    localStorage.setItem('restaurant_auth', 'true');
    localStorage.setItem('auth_timestamp', new Date().toISOString());
  }, []);

  const checkPasswordRealTime = useCallback((password) => {
    // Blocca se appena fatto logout
    if (justLoggedOutRef.current) {
      console.log('🚫 Bloccato - logout recente');
      return;
    }
    
    // Blocca se già autenticato
    if (isAuthorized) return;
    
    // Ignora vuoti
    if (!password || password.trim() === '') return;
    
    console.log('🔍 Verificando:', password);
    
    if (password === SITE_PASSWORD) {
      console.log('✅ Accesso garantito');
      handleAuthSuccess();
    }
  }, [isAuthorized, handleAuthSuccess]);

  const handleLogout = useCallback(() => {
    console.log('🚪 Logout');
    
    // Pulisci tutto
    localStorage.removeItem('restaurant_auth');
    localStorage.removeItem('auth_timestamp');
    
    // Imposta flag logout
    justLoggedOutRef.current = true;
    
    // Redirect pulito
    setTimeout(() => {
      window.location.href = '/?loggedout=true';
    }, 100);
  }, []);

  // 🔴 FOCUS AUTOMATICO SULL'INPUT (semplice)
  useEffect(() => {
    if (!isAuthorized && passwordRef.current) {
      console.log('🎯 Imposto focus su input password');
      
      // Piccolo delay per stabilizzare
      const timer = setTimeout(() => {
        if (passwordRef.current) {
          passwordRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthorized]);

  // 🔴 SE NON AUTORIZZATO: MOSTRA SOLO IL SECURITY MODAL
  if (!isAuthorized) {
    return (
      <>
        {/* Form falso per bloccare autofill browser */}
        <div style={{ display: 'none' }}>
          <input type="text" name="username" autoComplete="username" />
          <input type="password" name="password" autoComplete="current-password" />
        </div>
        
        {/* Modal di sicurezza */}
        <div className="security-modal-overlay">
          <div className="security-modal">
            <div className="modal-header">
              <h2 className="modal-title">🔐 Accesso Sistema</h2>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">
                Inserisci il codice di sicurezza:
              </p>
              
              <div className="password-form">
                <input
                  ref={passwordRef}
                  type="password"
                  id="password-input"
                  placeholder="Digita qui il codice..."
                  className="password-input"
                  autoComplete="new-password"
                  autoFocus
                  onChange={(e) => {
                    const password = e.target.value;
                    
                    // Debounce semplice
                    clearTimeout(window.passwordTimeout);
                    window.passwordTimeout = setTimeout(() => {
                      checkPasswordRealTime(password);
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      checkPasswordRealTime(e.target.value);
                    }
                  }}
                  // Attributi anti-autofill
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                />
              </div>
              
              <div className="modal-hint">
                <small>L'accesso è automatico quando il codice è corretto</small>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 🔴 SE AUTORIZZATO: APP NORMALE
  return (
    <>
      <LicenseModal />

      {mostraNavbar && (
        <nav className="main-navbar">
          <div className="navbar-center">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            <span className="nav-separator">|</span>
            <Link to="/operatore" className={`nav-link ${location.pathname === '/operatore' ? 'active' : ''}`}>
              Operatore
            </Link>
            <span className="nav-separator">|</span>
            <Link to="/gestione-menu" className={`nav-link ${location.pathname === '/gestione-menu' ? 'active' : ''}`}>
              Menu
            </Link>
          </div>
          
          <button onClick={handleLogout} className="logout-button">
            Logout
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