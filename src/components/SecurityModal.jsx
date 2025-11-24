import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SecurityModal.css';

const SecurityModal = ({ onSuccess, isOpen }) => {
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState(false);
  const [tentativi, setTentativi] = useState(0);
  const [caricamento, setCaricamento] = useState(false);
  const inputRef = useRef(null);

  // ✅ CARICA IL CODICE DAL JSON
  const caricaCodiceSicurezza = useCallback(async () => {
    try {
      const response = await fetch('/codice-sicurezza.json');
      if (!response.ok) throw new Error('File non trovato');
      const data = await response.json();
      return data.codice;
    } catch (error) {
      console.error('❌ Errore caricamento codice:', error);
      return '123456'; // ✅ CODICE DEFAULT A 6 CIFRE
    }
  }, []);

  // ✅ FOCUS AUTOMATICO SULL'INPUT
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setCodice('');
      setErrore(false);
      setTentativi(0);
    }
  }, [isOpen]);

  // ✅ VERIFICA CODICE QUANDO È COMPLETO (6 CIFRE)
  const verificaCodice = useCallback(async () => {
    if (codice.length !== 6 || caricamento) return;

    setCaricamento(true);
    
    try {
      const codiceCorretto = await caricaCodiceSicurezza();
      
      if (codice === codiceCorretto) {
        // ✅ CODICE CORRETTO
        setErrore(false);
        setTentativi(0);
        
        // ✅ SALVA DATA ACCESSO
        localStorage.setItem('ultimoAccesso', new Date().toISOString());
        
        // ✅ SUCCESSO CON FEEDBACK VISIVO
        if (inputRef.current) {
          inputRef.current.classList.add('success');
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
      } else {
        // ❌ CODICE ERRATO
        setErrore(true);
        setTentativi(prev => prev + 1);
        setCodice('');
        
        // ✅ SHAKE ANIMATION
        if (inputRef.current) {
          inputRef.current.classList.add('shake');
          setTimeout(() => {
            inputRef.current?.classList.remove('shake');
          }, 500);
        }
      }
    } catch (error) {
      console.error('❌ Errore verifica:', error);
      setErrore(true);
    } finally {
      setCaricamento(false);
    }
  }, [codice, caricamento, caricaCodiceSicurezza, onSuccess]);

  // ✅ VERIFICA AUTOMATICA QUANDO IL CODICE RAGGIUNGE 6 CIFRE
  useEffect(() => {
    if (codice.length === 6) {
      verificaCodice();
    }
  }, [codice, verificaCodice]);

  // ✅ GESTIONE INPUT
  const handleInputChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // ✅ LIMITA A 6 CIFRE
    setCodice(value);
    setErrore(false);
  }, []);

  // ✅ GESTIONE KEYDOWN PER INVIO
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && codice.length > 0) {
      verificaCodice();
    }
  }, [codice, verificaCodice]);

  if (!isOpen) return null;

  return (
    <div className="security-modal-overlay">
      <div className={`security-modal ${errore ? 'error' : ''} ${caricamento ? 'loading' : ''}`}>
        <div className="security-header">
          <h2>🔐 Codice di Sicurezza</h2>
          <p>Inserisci il codice a 6 cifre per accedere</p>
        </div>

        <div className="security-body">
          <div className="input-container">
            <input
              ref={inputRef}
              type="password" 
              inputMode="numeric"
              pattern="[0-9]*"
              value={codice}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
             // placeholder="••••••" 
              maxLength={6}
               className="security-input password-style"
              autoComplete="one-time-code"
              disabled={caricamento}
            />
            <div className="input-hint">
              {Array.from({ length: 6 }).map((_, index) => (
                <span 
                  key={index} 
                  className={`digit-placeholder ${index < codice.length ? 'filled' : ''}`}
                >
                  {index < codice.length ? '•' : '○'} {/* ✅ CERCHIETTI VUOTI */}
                </span>
              ))}
            </div>
            
         
          </div>

          {errore && (
            <div className="error-message">
              ❌ Codice errato! Tentativo {tentativi}
              {tentativi >= 3 && (
                <div className="warning">⚠️ Troppi tentativi errati</div>
              )}
            </div>
          )}

          <div className="security-info">
            <p>⏰ Il codice scade dopo 15 minuti di inattività</p>
            <p>🔢 Inserisci 6 cifre numeriche</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;