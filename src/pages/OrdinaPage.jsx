/*import React, { useState, useEffect, useRef } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  // ✅ NUOVO STATE PER STAMPANTE LOCALE
  const [stampanteOnline, setStampanteOnline] = useState(false);

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);


  
  // ✅ CONTROLLO STAMPANTE LOCALE
  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FUNZIONE STAMPA LOCALE
  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  // ✅ PRIMA CARICA TUTTI I DATI INIZIALI
  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            setCarrello(carrelloParsed);
            
            const piattiIds = carrelloParsed
              .filter(item => item.id !== 'coperto')
              .map(item => item.id);
            setPiattiSelezionati(piattiIds);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
  }, [tavolo, forceReload]);

  // ✅ CONTROLLA SE IL TAVOLO È GIÀ OCCUPATO
  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  // ✅ CARICA MENU E COPERT0
  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const normalized = (data || []).map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            console.log('🚨 INCOERENZA RILEVATA: Coperto=true ma carrello vuoto! FORZO RESET!');
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            console.log('✅ Controllo se mostrare modal - coperto non confermato');
            if (!tavoloOccupato) {
              console.log('✅ MOSTRO MODAL - tavolo libero e coperto non confermato');
              setMostraCopertoModal(true);
            } else {
              console.log('❌ NON mostro modal - tavolo già occupato');
              setMostraCopertoModal(false);
            }
          } 
          else {
            console.log('❌ NON mostro modal - coperto già confermato e carrello coerente');
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  // ✅ RILEVA CAMBIAMENTI LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Rilevato cambiamento localStorage - forzo ricaricamento');
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ SALVA CARRELLO IN LOCALSTORAGE
  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        console.log('⏸️ Salvato - coperto in attesa di conferma');
        return;
      }
      
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  // ✅ AGGIUNGI AL CARRELLO
  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      const esiste = prev.find(p => String(p.id) === String(prodotto.id));
      if (esiste) {
        return prev.map(p =>
          p.id === prodotto.id ? { ...p, quantita: p.quantita + 1 } : p
        );
      }
      return [...prev, { ...prodotto, quantita: 1 }];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  // ✅ RIMUOVI PRODOTTO
  const rimuoviProdotto = (id) => {
    setCarrello(prev => prev.filter(p => String(p.id) !== String(id)));
    setPiattiSelezionati(prev => prev.filter(pid => pid !== id));
  };

  // ✅ CONFERMA COPERTO
  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    console.log('💾 Coperto confermato e salvato per tavolo', tavolo);
    setMostraCopertoModal(false);
  };

  // ✅ CALCOLA TOTALI
  const totale = carrello.reduce(
    (s, p) => s + (Number(p.prezzo) * Number(p.quantita)), 0
  );
  const totaleArticoli = carrello.reduce((s, p) => s + p.quantita, 0);






// ✅ INVIA ORDINE - VERSIONE CORRETTA CON STAMPA LOCALE
const inviaOrdine = async () => {
  if (carrello.length === 0) {
    setMessaggio('Il carrello è vuoto');
    return;
  }

  let persone = numeroPersone;
  const copertoItem = carrello.find(i => i.id === 'coperto');
  if (copertoItem) {
    const m = String(copertoItem.nome).match(/x(\d+)/);
    if (m) persone = parseInt(m[1], 10);
  }

  const payload = {
    tavolo,
    ordinazione: carrello.map(p => ({
      prodotto: p.nome,
      quantità: p.quantita,
      prezzo: p.prezzo
    })),
    coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
    numeroPersone: copertoItem ? persone : 0,
    ipStampante: '172.20.10.8'
  };

  try {
    // ✅ 1. PRIMA SALVA SEMPRE SU RENDER (CLOUD)
    const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // ✅ CONTROLLO RISPOSTA SERVER
    if (!res.ok) {
      throw new Error('Errore salvataggio ordine su cloud');
    }

    await res.json(); // Verifica che la risposta sia JSON valido

    // ✅ 2. POI PROVA A STAMPARE LOCALMENTE
    let stampaRiuscita = false;
    if (stampanteOnline) {
      try {
        await stampaLocale(payload);
        stampaRiuscita = true;
        console.log('✅ Stampato localmente');
      } catch (printError) {
        console.log('❌ Stampa locale fallita:', printError);
        stampaRiuscita = false;
      }
    }

    // ✅ 3. MESSAGGIO INTELLIGENTE
    if (stampaRiuscita) {
      setMessaggio('✅ Ordine stampato e salvato!');
    } else if (stampanteOnline) {
      setMessaggio('✅ Ordine salvato (stampa fallita)');
    } else {
      setMessaggio('✅ Ordine salvato (modalità cloud)');
    }

    // ✅ 4. PULIZIA LOCALE (solo dopo che tutto è andato bene)
    setCarrello([]);
    setPiattiSelezionati([]);
    setMostraCarrello(false);
    localStorage.removeItem(`carrello_${tavolo}`);
    localStorage.removeItem(`copertoConfermato_${tavolo}`);
    localStorage.removeItem(`numeroPersone_${tavolo}`);
    
    console.log('🗑️ Ordine inviato - localStorage pulito');

  } catch (error) {
    console.error('❌ Errore completo:', error);
    setMessaggio('❌ Errore invio ordine');
    // ❌ NON pulire il carrello se c'è un errore
  } finally {
    setTimeout(() => setMessaggio(''), 4000);
  }
};

  const menuPerCategoria = menu.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  const getQuantitaProdotto = (prodottoId) => {
    const prodottoInCarrello = carrello.find(p => String(p.id) === String(prodottoId));
    return prodottoInCarrello ? prodottoInCarrello.quantita : 0;
  };

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ✅ INDICATORE STATO STAMPANTE *//*}
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => (
          <section key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="cards">
              {prodotti.map(p => (
                <article
                  key={p.id}
                  className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                  onClick={() => aggiungiProdotto(p)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="card-name">{p.nome}</div>
                  <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                  
                  {getQuantitaProdotto(p.id) > 0 && (
                    <div className="quantita-badge">
                      {getQuantitaProdotto(p.id)}
                    </div>
                  )}

                  {mostraCarrello && <div className="block-overlay"></div>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {carrello.map(item => (
                  <li key={item.id} className="cart-item">
                    <div>
                      <div className="item-name">{item.nome}</div>
                      <div className="item-meta">
                        {item.quantita} × € {item.prezzo.toFixed(2)}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="item-subtotale">
                        € {(item.prezzo * item.quantita).toFixed(2)}
                      </div>

                      {item.id !== 'coperto' && (
                        <button className="delete" onClick={() => rimuoviProdotto(item.id)}>
                          Elimina
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totale.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}




*/




















// funziona ma ha il problema del placeholder





/*import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  // ✅ NUOVO STATE PER STAMPANTE LOCALE
  const [stampanteOnline, setStampanteOnline] = useState(false);
  
  // ✅ STATE PER VARIANTI GLOBALI
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [modalVarianti, setModalVarianti] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [variantiSelezionate, setVariantiSelezionate] = useState([]);

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);

  // ✅ CARICA VARIANTI GLOBALI
  const caricaVariantiGlobali = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        // Cerca il prodotto di configurazione con le varianti
        const prodottoVarianti = data.find(p => 
          p.nome === "CONFIG_VARIANTI_GLOBALI" || 
          p.nome === "VARIANTI_GLOBALI_EXPORT" ||
          (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
        );
        
        if (prodottoVarianti && prodottoVarianti.varianti) {
          setVariantiGlobali(prodottoVarianti.varianti);
        }
      })
      .catch(() => setVariantiGlobali([]));
  }, []);

  // ✅ CONTROLLO STAMPANTE LOCALE
  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FUNZIONE STAMPA LOCALE
  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  // ✅ PRIMA CARICA TUTTI I DATI INIZIALI
  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            setCarrello(carrelloParsed);
            
            const piattiIds = carrelloParsed
              .filter(item => item.id !== 'coperto')
              .map(item => item.id);
            setPiattiSelezionati(piattiIds);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
    caricaVariantiGlobali();
  }, [tavolo, forceReload, caricaVariantiGlobali]);

  // ✅ CONTROLLA SE IL TAVOLO È GIÀ OCCUPATO
  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onnder.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  // ✅ CARICA MENU E COPERT0
  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const normalized = (data || []).map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            console.log('🚨 INCOERENZA RILEVATA: Coperto=true ma carrello vuoto! FORZO RESET!');
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            console.log('✅ Controllo se mostrare modal - coperto non confermato');
            if (!tavoloOccupato) {
              console.log('✅ MOSTRO MODAL - tavolo libero e coperto non confermato');
              setMostraCopertoModal(true);
            } else {
              console.log('❌ NON mostro modal - tavolo già occupato');
              setMostraCopertoModal(false);
            }
          } 
          else {
            console.log('❌ NON mostro modal - coperto già confermato e carrello coerente');
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  // ✅ RILEVA CAMBIAMENTI LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Rilevato cambiamento localStorage - forzo ricaricamento');
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ SALVA CARRELLO IN LOCALSTORAGE
  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        console.log('⏸️ Salvato - coperto in attesa di conferma');
        return;
      }
      
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  // ✅ AGGIUNGI AL CARRELLO
  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      const esiste = prev.find(p => String(p.id) === String(prodotto.id));
      if (esiste) {
        return prev.map(p =>
          p.id === prodotto.id ? { ...p, quantita: p.quantita + 1 } : p
        );
      }
      return [...prev, { ...prodotto, quantita: 1, varianti: [] }];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  // ✅ RIMUOVI PRODOTTO
  const rimuoviProdotto = (id) => {
    setCarrello(prev => prev.filter(p => String(p.id) !== String(id)));
    setPiattiSelezionati(prev => prev.filter(pid => pid !== id));
  };

  // ✅ APRI MODAL PER VARIANTI
  const apriModalVarianti = (prodotto) => {
    setProdottoSelezionato(prodotto);
    setVariantiSelezionate(prodotto.varianti || []);
    setModalVarianti(true);
  };

  // ✅ AGGIUNGI VARIANTE
  const aggiungiVariante = (variante) => {
    if (variante.tipo === 'aggiunta') {
      setVariantiSelezionate(prev => [...prev, variante]);
    } else {
      setVariantiSelezionate(prev => [...prev, variante]);
    }
  };

  // ✅ RIMUOVI VARIANTE
  const rimuoviVariante = (varianteId) => {
    setVariantiSelezionate(prev => prev.filter(v => v.id !== varianteId));
  };

  // ✅ CONFERMA VARIANTI
  const confermaVarianti = () => {
    setCarrello(prev =>
      prev.map(p =>
        p.id === prodottoSelezionato.id
          ? { ...p, varianti: [...variantiSelezionate] }
          : p
      )
    );
    setModalVarianti(false);
    setProdottoSelezionato(null);
  };

  // ✅ CALCOLA COSTO VARIANTI PER UN PRODOTTO
  const calcolaCostoVarianti = (varianti) => {
    if (!varianti || varianti.length === 0) return 0;
    return varianti
      .filter(v => v.tipo === 'aggiunta')
      .reduce((sum, v) => sum + (v.costo || 0), 0);
  };

  // ✅ CONFERMA COPERTO
  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    console.log('💾 Coperto confermato e salvato per tavolo', tavolo);
    setMostraCopertoModal(false);
  };

  // ✅ CALCOLA TOTALI
  const totaleCarrello = carrello.reduce((sum, item) => {
    const basePrezzo = item.prezzo * item.quantita;
    const costoVarianti = calcolaCostoVarianti(item.varianti) * item.quantita;
    return sum + basePrezzo + costoVarianti;
  }, 0);

  const totaleArticoli = carrello.reduce((s, p) => s + p.quantita, 0);

  // ✅ INVIA ORDINE - VERSIONE CORRETTA CON STAMPA LOCALE
  const inviaOrdine = async () => {
    if (carrello.length === 0) {
      setMessaggio('Il carrello è vuoto');
      return;
    }

    let persone = numeroPersone;
    const copertoItem = carrello.find(i => i.id === 'coperto');
    if (copertoItem) {
      const m = String(copertoItem.nome).match(/x(\d+)/);
      if (m) persone = parseInt(m[1], 10);
    }

    const payload = {
      tavolo,
      ordinazione: carrello.map(p => ({
        prodotto: p.nome,
        quantità: p.quantita,
        prezzo: p.prezzo,
        varianti: p.varianti || []
      })),
      coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
      numeroPersone: copertoItem ? persone : 0,
      ipStampante: '172.20.10.8'
    };

    try {
      // ✅ 1. PRIMA SALVA SEMPRE SU RENDER (CLOUD)
      const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // ✅ CONTROLLO RISPOSTA SERVER
      if (!res.ok) {
        throw new Error('Errore salvataggio ordine su cloud');
      }

      await res.json(); // Verifica che la risposta sia JSON valido

      // ✅ 2. POI PROVA A STAMPARE LOCALMENTE
      let stampaRiuscita = false;
      if (stampanteOnline) {
        try {
          await stampaLocale(payload);
          stampaRiuscita = true;
          console.log('✅ Stampato localmente');
        } catch (printError) {
          console.log('❌ Stampa locale fallita:', printError);
          stampaRiuscita = false;
        }
      }

      // ✅ 3. MESSAGGIO INTELLIGENTE
      if (stampaRiuscita) {
        setMessaggio('✅ Ordine stampato e salvato!');
      } else if (stampanteOnline) {
        setMessaggio('✅ Ordine salvato (stampa fallita)');
      } else {
        setMessaggio('✅ Ordine salvato (modalità cloud)');
      }

      // ✅ 4. PULIZIA LOCALE (solo dopo che tutto è andato bene)
      setCarrello([]);
      setPiattiSelezionati([]);
      setMostraCarrello(false);
      localStorage.removeItem(`carrello_${tavolo}`);
      localStorage.removeItem(`copertoConfermato_${tavolo}`);
      localStorage.removeItem(`numeroPersone_${tavolo}`);
      
      console.log('🗑️ Ordine inviato - localStorage pulito');

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setMessaggio('❌ Errore invio ordine');
      // ❌ NON pulire il carrello se c'è un errore
    } finally {
      setTimeout(() => setMessaggio(''), 4000);
    }
  };

const menuPerCategoria = menu.reduce((acc, item) => {
  // ✅ FILTRA VIA PRODOTTI DI CONFIGURAZIONE
  if (
    item.categoria === "Configurazione" ||
    item.nome.includes("CONFIG_") ||
    item.nome.includes("VARIANTI_GLOBALI")
  ) {
    return acc;
  }
  
  if (!acc[item.categoria]) acc[item.categoria] = [];
  acc[item.categoria].push(item);
  return acc;
}, {});

  const getQuantitaProdotto = (prodottoId) => {
    const prodottoInCarrello = carrello.find(p => String(p.id) === String(prodottoId));
    return prodottoInCarrello ? prodottoInCarrello.quantita : 0;
  };

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ✅ INDICATORE STATO STAMPANTE *//*}
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => (
          <section key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="cards">
              {prodotti.map(p => (
                <article
                  key={p.id}
                  className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                  onClick={() => aggiungiProdotto(p)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="card-name">{p.nome}</div>
                  <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                  
                  {getQuantitaProdotto(p.id) > 0 && (
                    <div className="quantita-badge">
                      {getQuantitaProdotto(p.id)}
                    </div>
                  )}

                  {mostraCarrello && <div className="block-overlay"></div>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {carrello.map(item => (
                  <li key={item.id} className="cart-item">
                    <div>
                      <div className="item-name">{item.nome}</div>
                      <div className="item-meta">
                        {item.quantita} × € {item.prezzo.toFixed(2)}
                        {item.varianti && item.varianti.length > 0 && (
                          <div className="varianti-list">
                            {item.varianti.map(v => (
                              <div key={v.id} className={`variante-item ${v.tipo}`}>
                                {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                                {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="item-subtotale">
                        € {(
                          (item.prezzo * item.quantita) + 
                          (calcolaCostoVarianti(item.varianti) * item.quantita)
                        ).toFixed(2)}
                      </div>

                      <div className="item-controls">
                        {/* ✅ BOTTONE VARIANTI *//*}
                        {item.id !== 'coperto' && (
                          <button 
                            className="varianti-btn"
                            onClick={() => apriModalVarianti(item)}
                            title="Aggiungi/rimuovi varianti"
                          >
                            Varianti
                          </button>
                        )}
                        
                        {/* ✅ BOTTONE ELIMINA *//*}
                        {item.id !== 'coperto' && (
                          <button 
                            className="delete" 
                            onClick={() => rimuoviProdotto(item.id)}
                          >
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totaleCarrello.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {/* ✅ MODAL PER VARIANTI *//*}
      {modalVarianti && prodottoSelezionato && (
        <div className="modal-backdrop">
          <div className="modal-varianti">
            <div className="modal-header">
              <h3>Varianti per: {prodottoSelezionato.nome}</h3>
              <button className="close" onClick={() => setModalVarianti(false)}>X</button>
            </div>
            
            <div className="modal-body">
              <p className="info-text">
                Seleziona le varianti da applicare a questo piatto:
              </p>
              
              <div className="varianti-disponibili">
                {variantiGlobali.length === 0 ? (
                  <p className="nessuna-variante">Nessuna variante disponibile</p>
                ) : (
                  variantiGlobali.map(variante => (
                    <div 
                      key={variante.id} 
                      className={`variante-option ${
                        variantiSelezionate.find(v => v.id === variante.id) ? 'selected' : ''
                      }`}
                    >
                      <div className="variante-info">
                        <span className="variante-nome">{variante.nome}</span>
                        <span className={`variante-tipo ${variante.tipo}`}>
                          {variante.tipo === 'aggiunta' 
                            ? `+ €${variante.costo.toFixed(2)}` 
                            : 'Rimozione'}
                        </span>
                      </div>
                      
                      <div className="variante-controls">
                        {variantiSelezionate.find(v => v.id === variante.id) ? (
                          <button 
                            className="btn-rimuovi"
                            onClick={() => rimuoviVariante(variante.id)}
                          >
                            ➖
                          </button>
                        ) : (
                          <button 
                            className="btn-aggiungi"
                            onClick={() => aggiungiVariante(variante)}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="varianti-selezionate">
                <h4>Varianti selezionate:</h4>
                {variantiSelezionate.length === 0 ? (
                  <p className="nessuna-selezione">Nessuna variante selezionata</p>
                ) : (
                  <ul>
                    {variantiSelezionate.map(v => (
                      <li key={v.id} className={`variante-selezionata ${v.tipo}`}>
                        <span>
                          {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                          {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="modal-buttons">
                <button className="btn-conferma" onClick={confermaVarianti}>
                  Conferma Varianti
                </button>
                <button className="btn-annulla" onClick={() => setModalVarianti(false)}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}



*/























//.   FUNZIONA MA CON IL 2X TOTELLINI 

/*import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  // ✅ NUOVO STATE PER STAMPANTE LOCALE
  const [stampanteOnline, setStampanteOnline] = useState(false);
  
  // ✅ STATE PER VARIANTI GLOBALI
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [modalVarianti, setModalVarianti] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [variantiSelezionate, setVariantiSelezionate] = useState([]);

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);

  // ✅ CARICA VARIANTI GLOBALI
  const caricaVariantiGlobali = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        // Cerca il prodotto di configurazione con le varianti
        const prodottoVarianti = data.find(p => 
          p.nome === "CONFIG_VARIANTI_GLOBALI" || 
          p.nome === "VARIANTI_GLOBALI_EXPORT" ||
          (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
        );
        
        if (prodottoVarianti && prodottoVarianti.varianti) {
          setVariantiGlobali(prodottoVarianti.varianti);
        }
      })
      .catch(() => setVariantiGlobali([]));
  }, []);

  // ✅ CONTROLLO STAMPANTE LOCALE
  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FUNZIONE STAMPA LOCALE
  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  // ✅ PRIMA CARICA TUTTI I DATI INIZIALI
  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            setCarrello(carrelloParsed);
            
            const piattiIds = carrelloParsed
              .filter(item => item.id !== 'coperto')
              .map(item => item.id);
            setPiattiSelezionati(piattiIds);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
    caricaVariantiGlobali();
  }, [tavolo, forceReload, caricaVariantiGlobali]);

  // ✅ CONTROLLA SE IL TAVOLO È GIÀ OCCUPATO
  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  // ✅ CARICA MENU E COPERT0 - CON FILTRO DEI PLACEHOLDER
  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        // 🔥 FILTRO MIGLIORATO: RIMUOVI TUTTI I PLACEHOLDER
        const menuFiltrato = (data || []).filter(item => 
          item.categoria !== "Configurazione" &&
          !item.nome?.includes("__CATEGORIA__") &&
          !item.nome?.includes("CATEGORIA_PLACEHOLDER") &&
          !item.nome?.includes("CONFIG_") &&
          !item.nome?.includes("VARIANTI_GLOBALI") &&
          !item.placeholder &&
          !item.isCategoriaPlaceholder
        );
        
        const normalized = menuFiltrato.map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            console.log('🚨 INCOERENZA RILEVATA: Coperto=true ma carrello vuoto! FORZO RESET!');
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            console.log('✅ Controllo se mostrare modal - coperto non confermato');
            if (!tavoloOccupato) {
              console.log('✅ MOSTRO MODAL - tavolo libero e coperto non confermato');
              setMostraCopertoModal(true);
            } else {
              console.log('❌ NON mostro modal - tavolo già occupato');
              setMostraCopertoModal(false);
            }
          } 
          else {
            console.log('❌ NON mostro modal - coperto già confermato e carrello coerente');
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  // ✅ RILEVA CAMBIAMENTI LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Rilevato cambiamento localStorage - forzo ricaricamento');
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ SALVA CARRELLO IN LOCALSTORAGE
  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        console.log('⏸️ Salvato - coperto in attesa di conferma');
        return;
      }
      
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  // ✅ AGGIUNGI AL CARRELLO
  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      const esiste = prev.find(p => String(p.id) === String(prodotto.id));
      if (esiste) {
        return prev.map(p =>
          p.id === prodotto.id ? { ...p, quantita: p.quantita + 1 } : p
        );
      }
      return [...prev, { ...prodotto, quantita: 1, varianti: [] }];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  // ✅ RIMUOVI PRODOTTO
  const rimuoviProdotto = (id) => {
    setCarrello(prev => prev.filter(p => String(p.id) !== String(id)));
    setPiattiSelezionati(prev => prev.filter(pid => pid !== id));
  };

  // ✅ APRI MODAL PER VARIANTI
  const apriModalVarianti = (prodotto) => {
    setProdottoSelezionato(prodotto);
    setVariantiSelezionate(prodotto.varianti || []);
    setModalVarianti(true);
  };

  // ✅ AGGIUNGI VARIANTE
  const aggiungiVariante = (variante) => {
    if (variante.tipo === 'aggiunta') {
      setVariantiSelezionate(prev => [...prev, variante]);
    } else {
      setVariantiSelezionate(prev => [...prev, variante]);
    }
  };

  // ✅ RIMUOVI VARIANTE
  const rimuoviVariante = (varianteId) => {
    setVariantiSelezionate(prev => prev.filter(v => v.id !== varianteId));
  };

  // ✅ CONFERMA VARIANTI
  const confermaVarianti = () => {
    setCarrello(prev =>
      prev.map(p =>
        p.id === prodottoSelezionato.id
          ? { ...p, varianti: [...variantiSelezionate] }
          : p
      )
    );
    setModalVarianti(false);
    setProdottoSelezionato(null);
  };

  // ✅ CALCOLA COSTO VARIANTI PER UN PRODOTTO
  const calcolaCostoVarianti = (varianti) => {
    if (!varianti || varianti.length === 0) return 0;
    return varianti
      .filter(v => v.tipo === 'aggiunta')
      .reduce((sum, v) => sum + (v.costo || 0), 0);
  };

  // ✅ CONFERMA COPERTO
  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    console.log('💾 Coperto confermato e salvato per tavolo', tavolo);
    setMostraCopertoModal(false);
  };

  // ✅ CALCOLA TOTALI
  const totaleCarrello = carrello.reduce((sum, item) => {
    const basePrezzo = item.prezzo * item.quantita;
    const costoVarianti = calcolaCostoVarianti(item.varianti) * item.quantita;
    return sum + basePrezzo + costoVarianti;
  }, 0);

  const totaleArticoli = carrello.reduce((s, p) => s + p.quantita, 0);

  // ✅ INVIA ORDINE - VERSIONE CORRETTA CON STAMPA LOCALE
  const inviaOrdine = async () => {
    if (carrello.length === 0) {
      setMessaggio('Il carrello è vuoto');
      return;
    }

    let persone = numeroPersone;
    const copertoItem = carrello.find(i => i.id === 'coperto');
    if (copertoItem) {
      const m = String(copertoItem.nome).match(/x(\d+)/);
      if (m) persone = parseInt(m[1], 10);
    }

    const payload = {
      tavolo,
      ordinazione: carrello.map(p => ({
        prodotto: p.nome,
        quantità: p.quantita,
        prezzo: p.prezzo,
        varianti: p.varianti || []
      })),
      coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
      numeroPersone: copertoItem ? persone : 0,
      ipStampante: '172.20.10.8'
    };

    try {
      // ✅ 1. PRIMA SALVA SEMPRE SU RENDER (CLOUD)
      const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // ✅ CONTROLLO RISPOSTA SERVER
      if (!res.ok) {
        throw new Error('Errore salvataggio ordine su cloud');
      }

      await res.json(); // Verifica che la risposta sia JSON valido

      // ✅ 2. POI PROVA A STAMPARE LOCALMENTE
      let stampaRiuscita = false;
      if (stampanteOnline) {
        try {
          await stampaLocale(payload);
          stampaRiuscita = true;
          console.log('✅ Stampato localmente');
        } catch (printError) {
          console.log('❌ Stampa locale fallita:', printError);
          stampaRiuscita = false;
        }
      }

      // ✅ 3. MESSAGGIO INTELLIGENTE
      if (stampaRiuscita) {
        setMessaggio('✅ Ordine stampato e salvato!');
      } else if (stampanteOnline) {
        setMessaggio('✅ Ordine salvato (stampa fallita)');
      } else {
        setMessaggio('✅ Ordine salvato (modalità cloud)');
      }

      // ✅ 4. PULIZIA LOCALE (solo dopo che tutto è andato bene)
      setCarrello([]);
      setPiattiSelezionati([]);
      setMostraCarrello(false);
      localStorage.removeItem(`carrello_${tavolo}`);
      localStorage.removeItem(`copertoConfermato_${tavolo}`);
      localStorage.removeItem(`numeroPersone_${tavolo}`);
      
      console.log('🗑️ Ordine inviato - localStorage pulito');

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setMessaggio('❌ Errore invio ordine');
      // ❌ NON pulire il carrello se c'è un errore
    } finally {
      setTimeout(() => setMessaggio(''), 4000);
    }
  };

  // ✅ ORDINA MENU PER CATEGORIA - CON FILTRO SICURO
  const menuPerCategoria = menu.reduce((acc, item) => {
    // 🔥 FILTRO DI SICUREZZA PER ESCLUDERE QUALSIASI RESIDUO
    if (
      !item.categoria ||
      item.categoria.trim() === "" ||
      item.categoria === "Configurazione" ||
      item.nome?.includes("__CATEGORIA__") ||
      item.nome?.includes("CATEGORIA_PLACEHOLDER") ||
      item.nome?.includes("CONFIG_") ||
      item.nome?.includes("VARIANTI_GLOBALI")
    ) {
      return acc;
    }
    
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  const getQuantitaProdotto = (prodottoId) => {
    const prodottoInCarrello = carrello.find(p => String(p.id) === String(prodottoId));
    return prodottoInCarrello ? prodottoInCarrello.quantita : 0;
  };

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ✅ INDICATORE STATO STAMPANTE *//*}
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => (
          <section key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="cards">
              {prodotti.map(p => (
                <article
                  key={p.id}
                  className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                  onClick={() => aggiungiProdotto(p)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="card-name">{p.nome}</div>
                  <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                  
                  {getQuantitaProdotto(p.id) > 0 && (
                    <div className="quantita-badge">
                      {getQuantitaProdotto(p.id)}
                    </div>
                  )}

                  {mostraCarrello && <div className="block-overlay"></div>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {carrello.map(item => (
                  <li key={item.id} className="cart-item">
                    <div>
                      <div className="item-name">{item.nome}</div>
                      <div className="item-meta">
                        {item.quantita} × € {item.prezzo.toFixed(2)}
                        {item.varianti && item.varianti.length > 0 && (
                          <div className="varianti-list">
                            {item.varianti.map(v => (
                              <div key={v.id} className={`variante-item ${v.tipo}`}>
                                {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                                {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="item-subtotale">
                        € {(
                          (item.prezzo * item.quantita) + 
                          (calcolaCostoVarianti(item.varianti) * item.quantita)
                        ).toFixed(2)}
                      </div>

                      <div className="item-controls">
                        {/* ✅ BOTTONE VARIANTI *//*}
                        {item.id !== 'coperto' && (
                          <button 
                            className="varianti-btn"
                            onClick={() => apriModalVarianti(item)}
                            title="Aggiungi/rimuovi varianti"
                          >
                            Varianti
                          </button>
                        )}
                        
                        {/* ✅ BOTTONE ELIMINA *//*}
                        {item.id !== 'coperto' && (
                          <button 
                            className="delete" 
                            onClick={() => rimuoviProdotto(item.id)}
                          >
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totaleCarrello.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {/* ✅ MODAL PER VARIANTI *//*}
      {modalVarianti && prodottoSelezionato && (
        <div className="modal-backdrop">
          <div className="modal-varianti">
            <div className="modal-header">
              <h3>Varianti per: {prodottoSelezionato.nome}</h3>
              <button className="close" onClick={() => setModalVarianti(false)}>X</button>
            </div>
            
            <div className="modal-body">
              <p className="info-text">
                Seleziona le varianti da applicare a questo piatto:
              </p>
              
              <div className="varianti-disponibili">
                {variantiGlobali.length === 0 ? (
                  <p className="nessuna-variante">Nessuna variante disponibile</p>
                ) : (
                  variantiGlobali.map(variante => (
                    <div 
                      key={variante.id} 
                      className={`variante-option ${
                        variantiSelezionate.find(v => v.id === variante.id) ? 'selected' : ''
                      }`}
                    >
                      <div className="variante-info">
                        <span className="variante-nome">{variante.nome}</span>
                        <span className={`variante-tipo ${variante.tipo}`}>
                          {variante.tipo === 'aggiunta' 
                            ? `+ €${variante.costo.toFixed(2)}` 
                            : 'Rimozione'}
                        </span>
                      </div>
                      
                      <div className="variante-controls">
                        {variantiSelezionate.find(v => v.id === variante.id) ? (
                          <button 
                            className="btn-rimuovi"
                            onClick={() => rimuoviVariante(variante.id)}
                          >
                            ➖
                          </button>
                        ) : (
                          <button 
                            className="btn-aggiungi"
                            onClick={() => aggiungiVariante(variante)}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="varianti-selezionate">
                <h4>Varianti selezionate:</h4>
                {variantiSelezionate.length === 0 ? (
                  <p className="nessuna-selezione">Nessuna variante selezionata</p>
                ) : (
                  <ul>
                    {variantiSelezionate.map(v => (
                      <li key={v.id} className={`variante-selezionata ${v.tipo}`}>
                        <span>
                          {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                          {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="modal-buttons">
                <button className="btn-conferma" onClick={confermaVarianti}>
                  Conferma Varianti
                </button>
                <button className="btn-annulla" onClick={() => setModalVarianti(false)}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}


*/






























//. FUNZIONA BENE PERò LEVO #1. SOLO SE C'è UN DOPPIONE


/*import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  // ✅ NUOVO STATE PER STAMPANTE LOCALE
  const [stampanteOnline, setStampanteOnline] = useState(false);
  
  // ✅ STATE PER VARIANTI GLOBALI
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [modalVarianti, setModalVarianti] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [variantiSelezionate, setVariantiSelezionate] = useState([]);
  const [piattoIndexSelezionato, setPiattoIndexSelezionato] = useState(null); // NUOVO: per identificare quale piatto stai modificando

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);

  // ✅ CARICA VARIANTI GLOBALI
  const caricaVariantiGlobali = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        // Cerca il prodotto di configurazione con le varianti
        const prodottoVarianti = data.find(p => 
          p.nome === "CONFIG_VARIANTI_GLOBALI" || 
          p.nome === "VARIANTI_GLOBALI_EXPORT" ||
          (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
        );
        
        if (prodottoVarianti && prodottoVarianti.varianti) {
          setVariantiGlobali(prodottoVarianti.varianti);
        }
      })
      .catch(() => setVariantiGlobali([]));
  }, []);

  // ✅ CONTROLLO STAMPANTE LOCALE
  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FUNZIONE STAMPA LOCALE
  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  // ✅ PRIMA CARICA TUTTI I DATI INIZIALI
  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            // 🔄 SEPARA I PIATTI CON QUANTITÀ > 1
            const carrelloSeparato = [];
            carrelloParsed.forEach(item => {
              if (item.quantita > 1) {
                // Per ogni piatto, crea una voce separata
                for (let i = 0; i < item.quantita; i++) {
                  carrelloSeparato.push({
                    ...item,
                    id: `${item.id}_piatto${i + 1}`,
                    quantita: 1,
                    piattoIndex: i + 1,
                    varianti: item.varianti || [] // NOTA: per ora copia le stesse varianti
                  });
                }
              } else {
                carrelloSeparato.push({
                  ...item,
                  piattoIndex: 1
                });
              }
            });
            
            setCarrello(carrelloSeparato);
            
            const piattiIds = carrelloSeparato
              .filter(item => item.id !== 'coperto')
              .map(item => item.originalId || item.id.split('_piatto')[0]); // Usa l'ID originale
            setPiattiSelezionati([...new Set(piattiIds)]);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
    caricaVariantiGlobali();
  }, [tavolo, forceReload, caricaVariantiGlobali]);

  // ✅ CONTROLLA SE IL TAVOLO È GIÀ OCCUPATO
  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  // ✅ CARICA MENU E COPERT0 - CON FILTRO DEI PLACEHOLDER
  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        // 🔥 FILTRO MIGLIORATO: RIMUOVI TUTTI I PLACEHOLDER
        const menuFiltrato = (data || []).filter(item => 
          item.categoria !== "Configurazione" &&
          !item.nome?.includes("__CATEGORIA__") &&
          !item.nome?.includes("CATEGORIA_PLACEHOLDER") &&
          !item.nome?.includes("CONFIG_") &&
          !item.nome?.includes("VARIANTI_GLOBALI") &&
          !item.placeholder &&
          !item.isCategoriaPlaceholder
        );
        
        const normalized = menuFiltrato.map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            console.log('🚨 INCOERENZA RILEVATA: Coperto=true ma carrello vuoto! FORZO RESET!');
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            console.log('✅ Controllo se mostrare modal - coperto non confermato');
            if (!tavoloOccupato) {
              console.log('✅ MOSTRO MODAL - tavolo libero e coperto non confermato');
              setMostraCopertoModal(true);
            } else {
              console.log('❌ NON mostro modal - tavolo già occupato');
              setMostraCopertoModal(false);
            }
          } 
          else {
            console.log('❌ NON mostro modal - coperto già confermato e carrello coerente');
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  // ✅ RILEVA CAMBIAMENTI LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Rilevato cambiamento localStorage - forzo ricaricamento');
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ SALVA CARRELLO IN LOCALSTORAGE
  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        console.log('⏸️ Salvato - coperto in attesa di conferma');
        return;
      }
      
      // 🔄 SALVA IL CARRELLO SEPARATO
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  // ✅ AGGIUNGI AL CARRELLO (MODIFICATA PER SEPARARE I PIATTI)
  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      // Trova tutti i piatti dello stesso tipo già nel carrello
      const piattiEsistenti = prev.filter(p => 
        (p.originalId && p.originalId === prodotto.id) || 
        p.id.split('_piatto')[0] === prodotto.id
      );
      
      // Crea un nuovo piatto con ID unico
      const nuovoPiatto = {
        ...prodotto,
        id: `${prodotto.id}_piatto${piattiEsistenti.length + 1}`,
        originalId: prodotto.id, // Salva l'ID originale
        quantita: 1,
        varianti: [],
        piattoIndex: piattiEsistenti.length + 1
      };
      
      return [...prev, nuovoPiatto];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  // ✅ RIMUOVI UN SINGOLO PIATTO
  const rimuoviPiatto = (id) => {
    setCarrello(prev => {
      const nuovoCarrello = prev.filter(p => p.id !== id);
      
      // Trova l'ID originale del piatto rimosso
      const piattoRimosso = prev.find(p => p.id === id);
      if (piattoRimosso) {
        const originalId = piattoRimosso.originalId || piattoRimosso.id.split('_piatto')[0];
        
        // Se non ci sono più piatti di questo tipo, rimuovi dall'elenco selezionati
        const altriPiattiStessoTipo = nuovoCarrello.filter(p => 
          (p.originalId && p.originalId === originalId) || 
          p.id.split('_piatto')[0] === originalId
        );
        
        if (altriPiattiStessoTipo.length === 0) {
          setPiattiSelezionati(prev => prev.filter(pid => pid !== originalId));
        }
        
        // Riordina i piattoIndex per gli altri piatti dello stesso tipo
        let index = 1;
        const carrelloRiordinato = nuovoCarrello.map(p => {
          const pOriginalId = p.originalId || p.id.split('_piatto')[0];
          if (pOriginalId === originalId) {
            return { ...p, piattoIndex: index++ };
          }
          return p;
        });
        
        return carrelloRiordinato;
      }
      
      return nuovoCarrello;
    });
  };

  // ✅ APRI MODAL PER VARIANTI DI UN SINGOLO PIATTO
  const apriModalVarianti = (prodotto) => {
    setProdottoSelezionato(prodotto);
    setPiattoIndexSelezionato(prodotto.piattoIndex);
    setVariantiSelezionate([...(prodotto.varianti || [])]);
    setModalVarianti(true);
  };

  // ✅ AGGIUNGI VARIANTE
  const aggiungiVariante = (variante) => {
    if (variante.tipo === 'aggiunta') {
      setVariantiSelezionate(prev => [...prev, variante]);
    } else {
      setVariantiSelezionate(prev => [...prev, variante]);
    }
  };

  // ✅ RIMUOVI VARIANTE
  const rimuoviVariante = (varianteId) => {
    setVariantiSelezionate(prev => prev.filter(v => v.id !== varianteId));
  };

  // ✅ CONFERMA VARIANTI PER UN SINGOLO PIATTO
  const confermaVarianti = () => {
    if (!prodottoSelezionato) return;
    
    setCarrello(prev =>
      prev.map(p =>
        p.id === prodottoSelezionato.id
          ? { ...p, varianti: [...variantiSelezionate] }
          : p
      )
    );
    setModalVarianti(false);
    setProdottoSelezionato(null);
    setPiattoIndexSelezionato(null);
  };

  // ✅ CALCOLA COSTO VARIANTI PER UN PRODOTTO
  const calcolaCostoVarianti = (varianti) => {
    if (!varianti || varianti.length === 0) return 0;
    return varianti
      .filter(v => v.tipo === 'aggiunta')
      .reduce((sum, v) => sum + (v.costo || 0), 0);
  };

  // ✅ CONFERMA COPERTO
  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    console.log('💾 Coperto confermato e salvato per tavolo', tavolo);
    setMostraCopertoModal(false);
  };

  // ✅ CALCOLA TOTALI
  const totaleCarrello = carrello.reduce((sum, item) => {
    const basePrezzo = item.prezzo * item.quantita;
    const costoVarianti = calcolaCostoVarianti(item.varianti) * item.quantita;
    return sum + basePrezzo + costoVarianti;
  }, 0);

  const totaleArticoli = carrello.filter(item => item.id !== 'coperto').length;

  // ✅ INVIA ORDINE - VERSIONE CORRETTA CON STAMPA LOCALE
  const inviaOrdine = async () => {
    if (carrello.length === 0) {
      setMessaggio('Il carrello è vuoto');
      return;
    }

    let persone = numeroPersone;
    const copertoItem = carrello.find(i => i.id === 'coperto');
    if (copertoItem) {
      const m = String(copertoItem.nome).match(/x(\d+)/);
      if (m) persone = parseInt(m[1], 10);
    }

    // 🔄 AGGIUSTA IL PAYLOAD: ogni piatto è una voce separata con quantità 1
    const payload = {
      tavolo,
      ordinazione: carrello.map(p => ({
        prodotto: p.id === 'coperto' ? p.nome : `${p.nome} #${p.piattoIndex || 1}`,
        quantità: 1, // Sempre 1 perché ogni piatto è una voce separata
        prezzo: p.prezzo,
        varianti: p.varianti || []
      })),
      coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
      numeroPersone: copertoItem ? persone : 0,
      ipStampante: '172.20.10.8'
    };

    try {
      // ✅ 1. PRIMA SALVA SEMPRE SU RENDER (CLOUD)
      const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // ✅ CONTROLLO RISPOSTA SERVER
      if (!res.ok) {
        throw new Error('Errore salvataggio ordine su cloud');
      }

      await res.json(); // Verifica che la risposta sia JSON valido

      // ✅ 2. POI PROVA A STAMPARE LOCALMENTE
      let stampaRiuscita = false;
      if (stampanteOnline) {
        try {
          await stampaLocale(payload);
          stampaRiuscita = true;
          console.log('✅ Stampato localmente');
        } catch (printError) {
          console.log('❌ Stampa locale fallita:', printError);
          stampaRiuscita = false;
        }
      }

      // ✅ 3. MESSAGGIO INTELLIGENTE
      if (stampaRiuscita) {
        setMessaggio('✅ Ordine stampato e salvato!');
      } else if (stampanteOnline) {
        setMessaggio('✅ Ordine salvato (stampa fallita)');
      } else {
        setMessaggio('✅ Ordine salvato (modalità cloud)');
      }

      // ✅ 4. PULIZIA LOCALE (solo dopo che tutto è andato bene)
      setCarrello([]);
      setPiattiSelezionati([]);
      setMostraCarrello(false);
      localStorage.removeItem(`carrello_${tavolo}`);
      localStorage.removeItem(`copertoConfermato_${tavolo}`);
      localStorage.removeItem(`numeroPersone_${tavolo}`);
      
      console.log('🗑️ Ordine inviato - localStorage pulito');

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setMessaggio('❌ Errore invio ordine');
      // ❌ NON pulire il carrello se c'è un errore
    } finally {
      setTimeout(() => setMessaggio(''), 4000);
    }
  };

  // ✅ OTTIENI IL NUMERO DI PIATTI DELLO STESSO TIPO
  const getNumeroPiatti = (prodottoId) => {
    return carrello.filter(p => 
      (p.originalId && p.originalId === prodottoId) || 
      p.id.split('_piatto')[0] === prodottoId
    ).length;
  };

  // ✅ ORDINA MENU PER CATEGORIA - CON FILTRO SICURO
  const menuPerCategoria = menu.reduce((acc, item) => {
    // 🔥 FILTRO DI SICUREZZA PER ESCLUDERE QUALSIASI RESIDUO
    if (
      !item.categoria ||
      item.categoria.trim() === "" ||
      item.categoria === "Configurazione" ||
      item.nome?.includes("__CATEGORIA__") ||
      item.nome?.includes("CATEGORIA_PLACEHOLDER") ||
      item.nome?.includes("CONFIG_") ||
      item.nome?.includes("VARIANTI_GLOBALI")
    ) {
      return acc;
    }
    
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  const getQuantitaProdotto = (prodottoId) => {
    return getNumeroPiatti(prodottoId);
  };

  // ✅ FUNZIONE PER RAGGRUPPARE I PIATTI NEL CARRELLO PER VISUALIZZAZIONE
  const getPiattiRaggruppati = () => {
    const gruppi = {};
    
    carrello.forEach(item => {
      if (item.id === 'coperto') {
        if (!gruppi.coperto) gruppi.coperto = [];
        gruppi.coperto.push(item);
      } else {
        const originalId = item.originalId || item.id.split('_piatto')[0];
        if (!gruppi[originalId]) gruppi[originalId] = [];
        gruppi[originalId].push(item);
      }
    });
    
    return gruppi;
  };

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ✅ INDICATORE STATO STAMPANTE *//*}
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => (
          <section key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="cards">
              {prodotti.map(p => (
                <article
                  key={p.id}
                  className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                  onClick={() => aggiungiProdotto(p)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="card-name">{p.nome}</div>
                  <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                  
                  {getQuantitaProdotto(p.id) > 0 && (
                    <div className="quantita-badge">
                      {getQuantitaProdotto(p.id)}
                    </div>
                  )}

                  {mostraCarrello && <div className="block-overlay"></div>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {Object.entries(getPiattiRaggruppati()).map(([gruppoId, piatti]) => {
                  if (gruppoId === 'coperto') {
                    // Coperto speciale
                    return piatti.map((item, idx) => (
                      <li key={`coperto_${idx}`} className="cart-item coperto">
                        <div>
                          <div className="item-name">{item.nome}</div>
                          <div className="item-meta">
                            {item.quantita} × € {item.prezzo.toFixed(2)}
                          </div>
                        </div>
                        <div className="item-subtotale">
                          € {(item.prezzo * item.quantita).toFixed(2)}
                        </div>
                      </li>
                    ));
                  }
                  
                  // Piatti normali - mostra ogni piatto separatamente
                  return piatti.map((item, idx) => (
                    <li key={item.id} className="cart-item">
                      <div>
                        <div className="item-name">
                          {item.nome} #{item.piattoIndex || idx + 1}
                        </div>
                        <div className="item-meta">
                          {item.quantita} × € {item.prezzo.toFixed(2)}
                          {item.varianti && item.varianti.length > 0 && (
                            <div className="varianti-list">
                              {item.varianti.map(v => (
                                <div key={v.id} className={`variante-item ${v.tipo}`}>
                                  {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                                  {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="item-subtotale">
                          € {(
                            (item.prezzo * item.quantita) + 
                            (calcolaCostoVarianti(item.varianti) * item.quantita)
                          ).toFixed(2)}
                        </div>

                        <div className="item-controls">
                          {/* ✅ BOTTONE VARIANTI *//*}
                          <button 
                            className="varianti-btn"
                            onClick={() => apriModalVarianti(item)}
                            title="Aggiungi/rimuovi varianti"
                          >
                            Varianti
                          </button>
                          
                          {/* ✅ BOTTONE ELIMINA *//*}
                          <button 
                            className="delete" 
                            onClick={() => rimuoviPiatto(item.id)}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </li>
                  ));
                })}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totaleCarrello.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {/* ✅ MODAL PER VARIANTI *//*}
      {modalVarianti && prodottoSelezionato && (
        <div className="modal-backdrop">
          <div className="modal-varianti">
            <div className="modal-header">
              <h3>Varianti per: {prodottoSelezionato.nome} #{piattoIndexSelezionato}</h3>
              <button className="close" onClick={() => setModalVarianti(false)}>X</button>
            </div>
            
            <div className="modal-body">
              <p className="info-text">
                Seleziona le varianti da applicare a <strong>questo piatto specifico</strong>:
              </p>
              
              <div className="varianti-disponibili">
                {variantiGlobali.length === 0 ? (
                  <p className="nessuna-variante">Nessuna variante disponibile</p>
                ) : (
                  variantiGlobali.map(variante => (
                    <div 
                      key={variante.id} 
                      className={`variante-option ${
                        variantiSelezionate.find(v => v.id === variante.id) ? 'selected' : ''
                      }`}
                    >
                      <div className="variante-info">
                        <span className="variante-nome">{variante.nome}</span>
                        <span className={`variante-tipo ${variante.tipo}`}>
                          {variante.tipo === 'aggiunta' 
                            ? `+ €${variante.costo.toFixed(2)}` 
                            : 'Rimozione'}
                        </span>
                      </div>
                      
                      <div className="variante-controls">
                        {variantiSelezionate.find(v => v.id === variante.id) ? (
                          <button 
                            className="btn-rimuovi"
                            onClick={() => rimuoviVariante(variante.id)}
                          >
                            ➖
                          </button>
                        ) : (
                          <button 
                            className="btn-aggiungi"
                            onClick={() => aggiungiVariante(variante)}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="varianti-selezionate">
                <h4>Varianti selezionate per questo piatto:</h4>
                {variantiSelezionate.length === 0 ? (
                  <p className="nessuna-selezione">Nessuna variante selezionata</p>
                ) : (
                  <ul>
                    {variantiSelezionate.map(v => (
                      <li key={v.id} className={`variante-selezionata ${v.tipo}`}>
                        <span>
                          {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                          {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="modal-buttons">
                <button className="btn-conferma" onClick={confermaVarianti}>
                  Conferma Varianti
                </button>
                <button className="btn-annulla" onClick={() => setModalVarianti(false)}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}



*/



























//FUNZIONA MA CON TUTTE LE VARIANTI PER CATEGORIA


/*import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  // ✅ NUOVO STATE PER STAMPANTE LOCALE
  const [stampanteOnline, setStampanteOnline] = useState(false);
  
  // ✅ STATE PER VARIANTI GLOBALI
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [modalVarianti, setModalVarianti] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [variantiSelezionate, setVariantiSelezionate] = useState([]);

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);

  // ✅ CARICA VARIANTI GLOBALI
  const caricaVariantiGlobali = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const prodottoVarianti = data.find(p => 
          p.nome === "CONFIG_VARIANTI_GLOBALI" || 
          p.nome === "VARIANTI_GLOBALI_EXPORT" ||
          (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
        );
        
        if (prodottoVarianti && prodottoVarianti.varianti) {
          setVariantiGlobali(prodottoVarianti.varianti);
        }
      })
      .catch(() => setVariantiGlobali([]));
  }, []);

  // ✅ CONTROLLO STAMPANTE LOCALE
  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FUNZIONE STAMPA LOCALE
  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  // ✅ PRIMA CARICA TUTTI I DATI INIZIALI
  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            // 🔄 SEPARA I PIATTI CON QUANTITÀ > 1
            const carrelloSeparato = [];
            carrelloParsed.forEach(item => {
              if (item.quantita > 1) {
                // Per ogni piatto, crea una voce separata
                for (let i = 0; i < item.quantita; i++) {
                  carrelloSeparato.push({
                    ...item,
                    id: `${item.id}_piatto${i + 1}`,
                    quantita: 1,
                    piattoIndex: i + 1,
                    varianti: item.varianti || []
                  });
                }
              } else {
                carrelloSeparato.push({
                  ...item,
                  piattoIndex: 1
                });
              }
            });
            
            setCarrello(carrelloSeparato);
            
            const piattiIds = carrelloSeparato
              .filter(item => item.id !== 'coperto')
              .map(item => item.originalId || item.id.split('_piatto')[0]);
            setPiattiSelezionati([...new Set(piattiIds)]);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
    caricaVariantiGlobali();
  }, [tavolo, forceReload, caricaVariantiGlobali]);

  // ✅ CONTROLLA SE IL TAVOLO È GIÀ OCCUPATO
  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  // ✅ CARICA MENU E COPERT0
  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const menuFiltrato = (data || []).filter(item => 
          item.categoria !== "Configurazione" &&
          !item.nome?.includes("__CATEGORIA__") &&
          !item.nome?.includes("CATEGORIA_PLACEHOLDER") &&
          !item.nome?.includes("CONFIG_") &&
          !item.nome?.includes("VARIANTI_GLOBALI") &&
          !item.placeholder &&
          !item.isCategoriaPlaceholder
        );
        
        const normalized = menuFiltrato.map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            } else {
              setMostraCopertoModal(false);
            }
          } 
          else {
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  // ✅ RILEVA CAMBIAMENTI LOCALSTORAGE
  useEffect(() => {
    const handleStorageChange = () => {
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ SALVA CARRELLO IN LOCALSTORAGE
  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        return;
      }
      
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  // ✅ AGGIUNGI AL CARRELLO
  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      // Trova tutti i piatti dello stesso tipo già nel carrello
      const piattiEsistenti = prev.filter(p => 
        (p.originalId && p.originalId === prodotto.id) || 
        p.id.split('_piatto')[0] === prodotto.id
      );
      
      const nuovoPiatto = {
        ...prodotto,
        id: `${prodotto.id}_piatto${piattiEsistenti.length + 1}`,
        originalId: prodotto.id,
        quantita: 1,
        varianti: [],
        piattoIndex: piattiEsistenti.length + 1
      };
      
      return [...prev, nuovoPiatto];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  // ✅ RIMUOVI UN SINGOLO PIATTO
  const rimuoviPiatto = (id) => {
    setCarrello(prev => {
      const nuovoCarrello = prev.filter(p => p.id !== id);
      
      const piattoRimosso = prev.find(p => p.id === id);
      if (piattoRimosso) {
        const originalId = piattoRimosso.originalId || piattoRimosso.id.split('_piatto')[0];
        
        const altriPiattiStessoTipo = nuovoCarrello.filter(p => 
          (p.originalId && p.originalId === originalId) || 
          p.id.split('_piatto')[0] === originalId
        );
        
        if (altriPiattiStessoTipo.length === 0) {
          setPiattiSelezionati(prev => prev.filter(pid => pid !== originalId));
        }
        
        // Riordina i piattoIndex
        let index = 1;
        const carrelloRiordinato = nuovoCarrello.map(p => {
          const pOriginalId = p.originalId || p.id.split('_piatto')[0];
          if (pOriginalId === originalId) {
            return { ...p, piattoIndex: index++ };
          }
          return p;
        });
        
        return carrelloRiordinato;
      }
      
      return nuovoCarrello;
    });
  };

  // ✅ APRI MODAL PER VARIANTI
  const apriModalVarianti = (prodotto) => {
    setProdottoSelezionato(prodotto);
    setVariantiSelezionate([...(prodotto.varianti || [])]);
    setModalVarianti(true);
  };

  // ✅ AGGIUNGI VARIANTE
  const aggiungiVariante = (variante) => {
    if (variante.tipo === 'aggiunta') {
      setVariantiSelezionate(prev => [...prev, variante]);
    } else {
      setVariantiSelezionate(prev => [...prev, variante]);
    }
  };

  // ✅ RIMUOVI VARIANTE
  const rimuoviVariante = (varianteId) => {
    setVariantiSelezionate(prev => prev.filter(v => v.id !== varianteId));
  };

  // ✅ CONFERMA VARIANTI
  const confermaVarianti = () => {
    if (!prodottoSelezionato) return;
    
    setCarrello(prev =>
      prev.map(p =>
        p.id === prodottoSelezionato.id
          ? { ...p, varianti: [...variantiSelezionate] }
          : p
      )
    );
    setModalVarianti(false);
    setProdottoSelezionato(null);
  };

  // ✅ CALCOLA COSTO VARIANTI
  const calcolaCostoVarianti = (varianti) => {
    if (!varianti || varianti.length === 0) return 0;
    return varianti
      .filter(v => v.tipo === 'aggiunta')
      .reduce((sum, v) => sum + (v.costo || 0), 0);
  };

  // ✅ CONFERMA COPERTO
  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    setMostraCopertoModal(false);
  };

  // ✅ CALCOLA TOTALI
  const totaleCarrello = carrello.reduce((sum, item) => {
    const basePrezzo = item.prezzo * item.quantita;
    const costoVarianti = calcolaCostoVarianti(item.varianti) * item.quantita;
    return sum + basePrezzo + costoVarianti;
  }, 0);

  const totaleArticoli = carrello.filter(item => item.id !== 'coperto').length;

  // ✅ INVIA ORDINE
  const inviaOrdine = async () => {
    if (carrello.length === 0) {
      setMessaggio('Il carrello è vuoto');
      return;
    }

    let persone = numeroPersone;
    const copertoItem = carrello.find(i => i.id === 'coperto');
    if (copertoItem) {
      const m = String(copertoItem.nome).match(/x(\d+)/);
      if (m) persone = parseInt(m[1], 10);
    }

    const payload = {
      tavolo,
      ordinazione: carrello.map(p => {
        if (p.id === 'coperto') {
          return {
            prodotto: p.nome,
            quantità: 1,
            prezzo: p.prezzo,
            varianti: []
          };
        }
        
        const originalId = p.originalId || p.id.split('_piatto')[0];
        const multipli = hasMultipliPiatti(originalId);
        const nomeProdotto = multipli ? `${p.nome} #${p.piattoIndex}` : p.nome;
        
        return {
          prodotto: nomeProdotto,
          quantità: 1,
          prezzo: p.prezzo,
          varianti: p.varianti || []
        };
      }),
      coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
      numeroPersone: copertoItem ? persone : 0,
      ipStampante: '172.20.10.8'
    };

    try {
      const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Errore salvataggio ordine su cloud');
      }

      await res.json();

      let stampaRiuscita = false;
      if (stampanteOnline) {
        try {
          await stampaLocale(payload);
          stampaRiuscita = true;
        } catch (printError) {
          stampaRiuscita = false;
        }
      }

      if (stampaRiuscita) {
        setMessaggio('✅ Ordine stampato e salvato!');
      } else if (stampanteOnline) {
        setMessaggio('✅ Ordine salvato (stampa fallita)');
      } else {
        setMessaggio('✅ Ordine salvato (modalità cloud)');
      }

      setCarrello([]);
      setPiattiSelezionati([]);
      setMostraCarrello(false);
      localStorage.removeItem(`carrello_${tavolo}`);
      localStorage.removeItem(`copertoConfermato_${tavolo}`);
      localStorage.removeItem(`numeroPersone_${tavolo}`);

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setMessaggio('❌ Errore invio ordine');
    } finally {
      setTimeout(() => setMessaggio(''), 4000);
    }
  };

  // ✅ OTTIENI IL NUMERO DI PIATTI DELLO STESSO TIPO
  const getNumeroPiatti = (prodottoId) => {
    return carrello.filter(p => 
      (p.originalId && p.originalId === prodottoId) || 
      p.id.split('_piatto')[0] === prodottoId
    ).length;
  };

  // ✅ OTTIENI SE CI SONO MULTIPLI PIATTI DELLO STESSO TIPO
  const hasMultipliPiatti = (prodottoId) => {
    return getNumeroPiatti(prodottoId) > 1;
  };

  // ✅ ORDINA MENU PER CATEGORIA
  const menuPerCategoria = menu.reduce((acc, item) => {
    if (
      !item.categoria ||
      item.categoria.trim() === "" ||
      item.categoria === "Configurazione" ||
      item.nome?.includes("__CATEGORIA__") ||
      item.nome?.includes("CATEGORIA_PLACEHOLDER") ||
      item.nome?.includes("CONFIG_") ||
      item.nome?.includes("VARIANTI_GLOBALI")
    ) {
      return acc;
    }
    
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  const getQuantitaProdotto = (prodottoId) => {
    return getNumeroPiatti(prodottoId);
  };

  // ✅ FUNZIONE PER RAGGRUPPARE I PIATTI
  const getPiattiRaggruppati = () => {
    const gruppi = {};
    
    carrello.forEach(item => {
      if (item.id === 'coperto') {
        if (!gruppi.coperto) gruppi.coperto = [];
        gruppi.coperto.push(item);
      } else {
        const originalId = item.originalId || item.id.split('_piatto')[0];
        if (!gruppi[originalId]) gruppi[originalId] = [];
        gruppi[originalId].push(item);
      }
    });
    
    return gruppi;
  };

  // ✅ FUNZIONE PER OTTENERE NOME DA VISUALIZZARE
  const getNomeVisualizzazione = (item, gruppoId) => {
    if (item.id === 'coperto') {
      return item.nome;
    }
    
    // 🔥 MOSTRA # SOLO SE CI SONO ALMENO 2 PIATTI DELLO STESSO TIPO
    const multipli = hasMultipliPiatti(gruppoId);
    if (multipli) {
      return `${item.nome} #${item.piattoIndex}`;
    }
    
    return item.nome; // Singolo piatto, senza #
  };

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => (
          <section key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="cards">
              {prodotti.map(p => (
                <article
                  key={p.id}
                  className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                  onClick={() => aggiungiProdotto(p)}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  <div className="card-name">{p.nome}</div>
                  <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                  
                  {getQuantitaProdotto(p.id) > 0 && (
                    <div className="quantita-badge">
                      {getQuantitaProdotto(p.id)}
                    </div>
                  )}

                  {mostraCarrello && <div className="block-overlay"></div>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {Object.entries(getPiattiRaggruppati()).map(([gruppoId, piatti]) => {
                  if (gruppoId === 'coperto') {
                    return piatti.map((item, idx) => (
                      <li key={`coperto_${idx}`} className="cart-item coperto">
                        <div>
                          <div className="item-name">{item.nome}</div>
                          <div className="item-meta">
                            {item.quantita} × € {item.prezzo.toFixed(2)}
                          </div>
                        </div>
                        <div className="item-subtotale">
                          € {(item.prezzo * item.quantita).toFixed(2)}
                        </div>
                      </li>
                    ));
                  }
                  
                  return piatti.map((item, idx) => (
                    <li key={item.id} className="cart-item">
                      <div>
                        <div className="item-name">
                          {/* 🔥 USA LA FUNZIONE PER DECIDERE SE MOSTRARE # *//*}
                          {getNomeVisualizzazione(item, gruppoId)}
                        </div>
                        <div className="item-meta">
                          {item.quantita} × € {item.prezzo.toFixed(2)}
                          {item.varianti && item.varianti.length > 0 && (
                            <div className="varianti-list">
                              {item.varianti.map(v => (
                                <div key={v.id} className={`variante-item ${v.tipo}`}>
                                  {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                                  {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="item-subtotale">
                          € {(
                            (item.prezzo * item.quantita) + 
                            (calcolaCostoVarianti(item.varianti) * item.quantita)
                          ).toFixed(2)}
                        </div>

                        <div className="item-controls">
                          <button 
                            className="varianti-btn"
                            onClick={() => apriModalVarianti(item)}
                            title="Aggiungi/rimuovi varianti"
                          >
                            Varianti
                          </button>
                          
                          <button 
                            className="delete" 
                            onClick={() => rimuoviPiatto(item.id)}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </li>
                  ));
                })}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totaleCarrello.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {/* ✅ MODAL PER VARIANTI *//*}
      {modalVarianti && prodottoSelezionato && (
        <div className="modal-backdrop">
          <div className="modal-varianti">
            <div className="modal-header">
              <h3>Varianti per: {prodottoSelezionato.nome}</h3>
              <button className="close" onClick={() => setModalVarianti(false)}>X</button>
            </div>
            
            <div className="modal-body">
              <p className="info-text">
                Seleziona le varianti da applicare a questo piatto:
              </p>
              
              <div className="varianti-disponibili">
                {variantiGlobali.length === 0 ? (
                  <p className="nessuna-variante">Nessuna variante disponibile</p>
                ) : (
                  variantiGlobali.map(variante => (
                    <div 
                      key={variante.id} 
                      className={`variante-option ${
                        variantiSelezionate.find(v => v.id === variante.id) ? 'selected' : ''
                      }`}
                    >
                      <div className="variante-info">
                        <span className="variante-nome">{variante.nome}</span>
                        <span className={`variante-tipo ${variante.tipo}`}>
                          {variante.tipo === 'aggiunta' 
                            ? `+ €${variante.costo.toFixed(2)}` 
                            : 'Rimozione'}
                        </span>
                      </div>
                      
                      <div className="variante-controls">
                        {variantiSelezionate.find(v => v.id === variante.id) ? (
                          <button 
                            className="btn-rimuovi"
                            onClick={() => rimuoviVariante(variante.id)}
                          >
                            ➖
                          </button>
                        ) : (
                          <button 
                            className="btn-aggiungi"
                            onClick={() => aggiungiVariante(variante)}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="varianti-selezionate">
                <h4>Varianti selezionate per questo piatto:</h4>
                {variantiSelezionate.length === 0 ? (
                  <p className="nessuna-selezione">Nessuna variante selezionata</p>
                ) : (
                  <ul>
                    {variantiSelezionate.map(v => (
                      <li key={v.id} className={`variante-selezionata ${v.tipo}`}>
                        <span>
                          {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                          {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="modal-buttons">
                  <button className="btn-annulla1" onClick={() => setModalVarianti(false)}>
                  Annulla
                </button>
                <button className="btn-conferma" onClick={confermaVarianti}>
                  Conferma Varianti
                </button>
              
              </div>
            </div>
          </div>
        </div>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}


*/




























import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OrdinaPage.css';

export default function OrdinaPage() {
  const tavolo = new URLSearchParams(window.location.search).get('tavolo') || 'Sconosciuto';

  const [menu, setMenu] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [piattiSelezionati, setPiattiSelezionati] = useState([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [bump, setBump] = useState(false);
  const bumpTimeout = useRef(null);

  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState(0);
  const [mostraCopertoModal, setMostraCopertoModal] = useState(false);
  const [numeroPersone, setNumeroPersone] = useState(1);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [tavoloOccupato, setTavoloOccupato] = useState(false);
  
  const [stampanteOnline, setStampanteOnline] = useState(false);
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [modalVarianti, setModalVarianti] = useState(false);
  const [prodottoSelezionato, setProdottoSelezionato] = useState(null);
  const [variantiSelezionate, setVariantiSelezionate] = useState([]);
  const [categorieImpostazioni, setCategorieImpostazioni] = useState({});

  const parsePrice = (p) => {
    if (!p && p !== 0) return 0;
    const s = String(p).replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(s) || 0;
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (mostraCopertoModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [mostraCopertoModal]);

  const caricaImpostazioniCategorie = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/categorie-impostazioni')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API not available');
      })
      .then(data => {
        setCategorieImpostazioni(data);
      })
      .catch(() => {
        const localData = JSON.parse(localStorage.getItem('categorie_varianti') || '{}');
        setCategorieImpostazioni(localData);
      });
  }, []);

  const caricaVariantiGlobali = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const prodottoVarianti = data.find(p => 
          p.nome === "CONFIG_VARIANTI_GLOBALI" || 
          p.nome === "VARIANTI_GLOBALI_EXPORT" ||
          (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
        );
        
        if (prodottoVarianti && prodottoVarianti.varianti) {
          setVariantiGlobali(prodottoVarianti.varianti);
        }
      })
      .catch(() => setVariantiGlobali([]));
  }, []);

  const sonoVariantiAbilitatePerCategoria = useCallback((categoria) => {
    if (categorieImpostazioni[categoria] === undefined) return true;
    return categorieImpostazioni[categoria] !== false;
  }, [categorieImpostazioni]);

  const getCategoriaProdotto = useCallback((prodottoId) => {
    const prodotto = menu.find(p => p.id === prodottoId);
    return prodotto ? prodotto.categoria : null;
  }, [menu]);

  useEffect(() => {
    const checkStampante = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3002/api/health');
        setStampanteOnline(response.ok);
      } catch {
        setStampanteOnline(false);
      }
    };

    checkStampante();
    const interval = setInterval(checkStampante, 10000);
    return () => clearInterval(interval);
  }, []);

  const stampaLocale = async (ordineData) => {
    try {
      const response = await fetch('http://172.20.10.2:3002/api/stampa-ordine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine: ordineData })
      });
      
      if (!response.ok) {
        throw new Error('Errore stampa locale');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Servizio stampa non disponibile');
    }
  };

  useEffect(() => {
    const caricaDatiIniziali = async () => {
      try {
        const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
        
        if (carrelloSalvato) {
          try {
            const carrelloParsed = JSON.parse(carrelloSalvato);
            const carrelloSeparato = [];
            carrelloParsed.forEach(item => {
              if (item.quantita > 1) {
                for (let i = 0; i < item.quantita; i++) {
                  carrelloSeparato.push({
                    ...item,
                    id: `${item.id}_piatto${i + 1}`,
                    quantita: 1,
                    piattoIndex: i + 1,
                    varianti: item.varianti || []
                  });
                }
              } else {
                carrelloSeparato.push({
                  ...item,
                  piattoIndex: 1
                });
              }
            });
            
            setCarrello(carrelloSeparato);
            
            const piattiIds = carrelloSeparato
              .filter(item => item.id !== 'coperto')
              .map(item => item.originalId || item.id.split('_piatto')[0]);
            setPiattiSelezionati([...new Set(piattiIds)]);
          } catch (e) {
            console.error('Errore nel caricamento del carrello:', e);
          }
        }
        
        setDatiCaricati(true);
        
      } catch (error) {
        console.error('Errore nel caricamento iniziale:', error);
        setDatiCaricati(true);
      }
    };

    caricaDatiIniziali();
    caricaVariantiGlobali();
    caricaImpostazioniCategorie();
  }, [tavolo, forceReload, caricaVariantiGlobali, caricaImpostazioniCategorie]);

  useEffect(() => {
    if (!datiCaricati) return;
    
    const checkStatoTavolo = async () => {
      try {
        const response = await fetch('https://qrcode-finale.onrender.com/api/tavoli/occupati');
        const tavoliOccupati = await response.json();
        const isOccupato = tavoliOccupati.includes(tavolo.toString());
        
        setTavoloOccupato(isOccupato);
        
        if (isOccupato) {
          console.log(`✅ Tavolo ${tavolo} già occupato - Salto occupazione`);
        } else {
          console.log('🚀 Apertura pagina ordini - Occupo tavolo', tavolo);
          fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tavolo })
          }).catch(err => console.error('Errore occupazione tavolo:', err));
        }
      } catch (error) {
        console.error('❌ Errore controllo tavolo occupato:', error);
        fetch('https://qrcode-finale.onrender.com/api/tavoli/occupa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tavolo })
        }).catch(err => console.error('Errore occupazione tavolo:', err));
      }
    };

    checkStatoTavolo();
  }, [datiCaricati, tavolo]);

  useEffect(() => {
    if (!datiCaricati) return;

    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        const menuFiltrato = (data || []).filter(item => 
          item.categoria !== "Configurazione" &&
          !item.nome?.includes("__CATEGORIA__") &&
          !item.nome?.includes("CATEGORIA_PLACEHOLDER") &&
          !item.nome?.includes("CONFIG_") &&
          !item.nome?.includes("VARIANTI_GLOBALI") &&
          !item.placeholder &&
          !item.isCategoriaPlaceholder
        );
        
        const normalized = menuFiltrato.map((it, idx) => ({
          id: it.id ?? `${String(it.nome)}-${idx}`,
          nome: it.nome,
          categoria: it.categoria,
          prezzo: parsePrice(it.prezzo)
        }));
        
        setMenu(normalized);
      })
      .catch(() => setMenu([]));

    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        if (data && data.attivo) {
          setCopertoAttivo(true);
          setPrezzoCoperto(parsePrice(data.prezzo));
          
          const copertoConfermato = localStorage.getItem(`copertoConfermato_${tavolo}`);
          const carrelloSalvato = localStorage.getItem(`carrello_${tavolo}`);
          const carrelloVuoto = !carrelloSalvato || carrelloSalvato === '[]' || carrelloSalvato === 'null';
          
          if (copertoConfermato === 'true' && carrelloVuoto) {
            localStorage.setItem(`copertoConfermato_${tavolo}`, 'false');
            localStorage.removeItem(`numeroPersone_${tavolo}`);
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            }
          } 
          else if (copertoConfermato !== 'true') {
            if (!tavoloOccupato) {
              setMostraCopertoModal(true);
            } else {
              setMostraCopertoModal(false);
            }
          } 
          else {
            setMostraCopertoModal(false);
          }
        } else {
          setCopertoAttivo(false);
          setMostraCopertoModal(false);
        }
      })
      .catch(() => {
        setCopertoAttivo(false);
        setMostraCopertoModal(false);
      });
  }, [datiCaricati, tavolo, forceReload, tavoloOccupato]);

  useEffect(() => {
    if (!datiCaricati || menu.length === 0) return;

    let carrelloAggiornato = false;
    const nuovoCarrello = carrello.map(item => {
      if (item.id === 'coperto') return item;
      
      const originalId = item.originalId || item.id.split('_piatto')[0];
      const categoria = getCategoriaProdotto(originalId);
      
      if (!categoria) return item;
      
      const variantiAbilitate = sonoVariantiAbilitatePerCategoria(categoria);
      
      if (!variantiAbilitate && item.varianti && item.varianti.length > 0) {
        carrelloAggiornato = true;
        return { ...item, varianti: [] };
      }
      
      return item;
    });
    
    if (carrelloAggiornato) {
      setCarrello(nuovoCarrello);
    }
  }, [datiCaricati, menu, carrello, getCategoriaProdotto, sonoVariantiAbilitatePerCategoria]);

  useEffect(() => {
    const handleStorageChange = () => {
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (datiCaricati) {
      const copertoConfermatoAttuale = localStorage.getItem(`copertoConfermato_${tavolo}`);
      
      if (copertoConfermatoAttuale === 'false') {
        return;
      }
      
      localStorage.setItem(`carrello_${tavolo}`, JSON.stringify(carrello));
    }
  }, [carrello, tavolo, datiCaricati]);

  const aggiungiProdotto = (prodotto) => {
    setCarrello(prev => {
      const piattiEsistenti = prev.filter(p => 
        (p.originalId && p.originalId === prodotto.id) || 
        p.id.split('_piatto')[0] === prodotto.id
      );
      
      const nuovoPiatto = {
        ...prodotto,
        id: `${prodotto.id}_piatto${piattiEsistenti.length + 1}`,
        originalId: prodotto.id,
        quantita: 1,
        varianti: [],
        piattoIndex: piattiEsistenti.length + 1
      };
      
      return [...prev, nuovoPiatto];
    });

    setPiattiSelezionati(prev => {
      if (!prev.includes(prodotto.id)) return [...prev, prodotto.id];
      return prev;
    });

    if (bumpTimeout.current) clearTimeout(bumpTimeout.current);
    setBump(true);
    bumpTimeout.current = setTimeout(() => setBump(false), 300);
  };

  const rimuoviPiatto = (id) => {
    setCarrello(prev => {
      const nuovoCarrello = prev.filter(p => p.id !== id);
      
      const piattoRimosso = prev.find(p => p.id === id);
      if (piattoRimosso) {
        const originalId = piattoRimosso.originalId || piattoRimosso.id.split('_piatto')[0];
        
        const altriPiattiStessoTipo = nuovoCarrello.filter(p => 
          (p.originalId && p.originalId === originalId) || 
          p.id.split('_piatto')[0] === originalId
        );
        
        if (altriPiattiStessoTipo.length === 0) {
          setPiattiSelezionati(prev => prev.filter(pid => pid !== originalId));
        }
        
        let index = 1;
        const carrelloRiordinato = nuovoCarrello.map(p => {
          const pOriginalId = p.originalId || p.id.split('_piatto')[0];
          if (pOriginalId === originalId) {
            return { ...p, piattoIndex: index++ };
          }
          return p;
        });
        
        return carrelloRiordinato;
      }
      
      return nuovoCarrello;
    });
  };

  const aggiungiVariante = (variante) => {
    if (variante.tipo === 'aggiunta') {
      setVariantiSelezionate(prev => [...prev, variante]);
    } else {
      setVariantiSelezionate(prev => [...prev, variante]);
    }
  };

  const rimuoviVariante = (varianteId) => {
    setVariantiSelezionate(prev => prev.filter(v => v.id !== varianteId));
  };

  const confermaVarianti = () => {
    if (!prodottoSelezionato) return;
    
    setCarrello(prev =>
      prev.map(p =>
        p.id === prodottoSelezionato.id
          ? { ...p, varianti: [...variantiSelezionate] }
          : p
      )
    );
    setModalVarianti(false);
    setProdottoSelezionato(null);
  };

  const calcolaCostoVarianti = (varianti) => {
    if (!varianti || varianti.length === 0) return 0;
    return varianti
      .filter(v => v.tipo === 'aggiunta')
      .reduce((sum, v) => sum + (v.costo || 0), 0);
  };

  const confermaCoperto = () => {
    const n = parseInt(numeroPersone, 10);
    if (!n || n <= 0) {
      alert('Inserisci un numero valido di persone (>=1)');
      return;
    }
    const totaleCoperto = parseFloat((prezzoCoperto * n).toFixed(2));
    const itemCoperto = {
      id: 'coperto',
      nome: ` Coperto x ${n}`,
      quantita: 1,
      prezzo: totaleCoperto
    };

    setCarrello(prev => {
      const senza = prev.filter(p => p.id !== 'coperto');
      return [...senza, itemCoperto];
    });

    localStorage.setItem(`copertoConfermato_${tavolo}`, 'true');
    localStorage.setItem(`numeroPersone_${tavolo}`, String(n));
    
    setMostraCopertoModal(false);
  };

  const totaleCarrello = carrello.reduce((sum, item) => {
    const basePrezzo = item.prezzo * item.quantita;
    const costoVarianti = calcolaCostoVarianti(item.varianti) * item.quantita;
    return sum + basePrezzo + costoVarianti;
  }, 0);

  const totaleArticoli = carrello.filter(item => item.id !== 'coperto').length;

  const inviaOrdine = async () => {
    if (carrello.length === 0) {
      setMessaggio('Il carrello è vuoto');
      return;
    }

    let persone = numeroPersone;
    const copertoItem = carrello.find(i => i.id === 'coperto');
    if (copertoItem) {
      const m = String(copertoItem.nome).match(/x(\d+)/);
      if (m) persone = parseInt(m[1], 10);
    }

    const payload = {
      tavolo,
      ordinazione: carrello.map(p => {
        if (p.id === 'coperto') {
          return {
            prodotto: p.nome,
            quantità: 1,
            prezzo: p.prezzo,
            varianti: []
          };
        }
        
        const originalId = p.originalId || p.id.split('_piatto')[0];
        const multipli = getNumeroPiatti(originalId) > 1;
        const nomeProdotto = multipli ? `${p.nome} ${p.piattoIndex}` : p.nome;
        
        return {
          prodotto: nomeProdotto,
          quantità: 1,
          prezzo: p.prezzo,
          varianti: p.varianti || []
        };
      }),
      coperto: copertoItem ? Number(copertoItem.prezzo) : 0,
      numeroPersone: copertoItem ? persone : 0,
      ipStampante: '172.20.10.8'
    };

    try {
      const res = await fetch('https://qrcode-finale.onrender.com/api/ordina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Errore salvataggio ordine su cloud');
      }

      await res.json();

      let stampaRiuscita = false;
      if (stampanteOnline) {
        try {
          await stampaLocale(payload);
          stampaRiuscita = true;
        } catch (printError) {
          stampaRiuscita = false;
        }
      }

      if (stampaRiuscita) {
        setMessaggio('✅ Ordine stampato e salvato!');
      } else if (stampanteOnline) {
        setMessaggio('✅ Ordine salvato (stampa fallita)');
      } else {
        setMessaggio('✅ Ordine salvato (modalità cloud)');
      }

      setCarrello([]);
      setPiattiSelezionati([]);
      setMostraCarrello(false);
      localStorage.removeItem(`carrello_${tavolo}`);
      localStorage.removeItem(`copertoConfermato_${tavolo}`);
      localStorage.removeItem(`numeroPersone_${tavolo}`);

    } catch (error) {
      console.error('❌ Errore completo:', error);
      setMessaggio('❌ Errore invio ordine');
    } finally {
      setTimeout(() => setMessaggio(''), 4000);
    }
  };

  const getNumeroPiatti = (prodottoId) => {
    return carrello.filter(p => 
      (p.originalId && p.originalId === prodottoId) || 
      p.id.split('_piatto')[0] === prodottoId
    ).length;
  };

  const getQuantitaProdotto = (prodottoId) => {
    return getNumeroPiatti(prodottoId);
  };

  const menuPerCategoria = menu.reduce((acc, item) => {
    if (
      !item.categoria ||
      item.categoria.trim() === "" ||
      item.categoria === "Configurazione" ||
      item.nome?.includes("__CATEGORIA__") ||
      item.nome?.includes("CATEGORIA_PLACEHOLDER") ||
      item.nome?.includes("CONFIG_") ||
      item.nome?.includes("VARIANTI_GLOBALI")
    ) {
      return acc;
    }
    
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  return (
    <div className="ordina-wrap">
      <header className="ordina-header">
        <h1>Menù — Tavolo {tavolo}</h1>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div 
            className={`stampante-indicator ${stampanteOnline ? 'online' : 'offline'}`}
            title={stampanteOnline ? 'Stampante connessa' : 'Stampante non disponibile'}
          >
            🖨️
          </div>

          <button
            className={`cart-btn ${bump ? 'bump' : ''}`}
            onClick={() => setMostraCarrello(v => !v)}
          >
            <svg className="cart-svg" viewBox="0 0 24 24" width="28" height="28">
              <path
                d="M7 4h-2l-1 2h2l2.68 8.39a2 2 0 0 0 1.94 1.36h7.76l1.02-4H9.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="20" r="1" fill="currentColor" />
            </svg>

            {totaleArticoli > 0 && <span className="cart-badge">{totaleArticoli}</span>}
          </button>
        </div>
      </header>

      <main className="menu-container">
        {Object.entries(menuPerCategoria).length === 0 && <div className="avviso">Menu vuoto</div>}

        {Object.entries(menuPerCategoria).map(([categoria, prodotti]) => {
          const variantiAbilitate = sonoVariantiAbilitatePerCategoria(categoria);
          
          return (
            <section key={categoria} className="categoria">
              <div className="categoria-header">
                <h2>{categoria}</h2>
                {!variantiAbilitate && (
                  <div className="categoria-no-varianti">
                    <span className="no-varianti-badge">No varianti</span>
                  </div>
                )}
              </div>
              <div className="cards">
                {prodotti.map(p => (
                  <article
                    key={p.id}
                    className={`card ${piattiSelezionati.includes(p.id) ? 'selected' : ''} ${mostraCarrello ? 'disabled' : ''}`}
                    onClick={() => aggiungiProdotto(p)}
                    role="button"
                    tabIndex={0}
                    style={{ 
                      cursor: mostraCarrello ? 'not-allowed' : 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div className="card-name">{p.nome}</div>
                    <div className="card-price">€ {p.prezzo.toFixed(2)}</div>
                    
                    {getQuantitaProdotto(p.id) > 0 && (
                      <div className="quantita-badge">
                        {getQuantitaProdotto(p.id)}
                      </div>
                    )}

                    {mostraCarrello && <div className="block-overlay"></div>}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {mostraCarrello && (
        <aside className="cart-drawer">
          <div className="cart-top">
            <h3>Il tuo carrello</h3>
            <button className="close" onClick={() => setMostraCarrello(false)}>X</button>
          </div>

          {carrello.length === 0 ? (
            <div className="vuoto">Il carrello è vuoto — aggiungi dei piatti</div>
          ) : (
            <>
              <ul className="cart-list">
                {carrello.map((item) => {
                  if (item.id === 'coperto') {
                    return (
                      <li key={`coperto_${item.id}`} className="cart-item coperto">
                        <div>
                          <div className="item-name">{item.nome}</div>
                          <div className="item-meta">
                            {item.quantita} × € {item.prezzo.toFixed(2)}
                          </div>
                        </div>
                        <div className="item-subtotale">
                          € {(item.prezzo * item.quantita).toFixed(2)}
                        </div>
                      </li>
                    );
                  }
                  
                  const originalId = item.originalId || 
                    (item.id.includes('_piatto') ? item.id.split('_piatto')[0] : item.id);
                  
                  const prodottoMenu = menu.find(p => p.id === originalId);
                  const categoria = prodottoMenu ? prodottoMenu.categoria : null;
                  
                  const mostraTastoVarianti = categoria && 
                                              categorieImpostazioni[categoria] !== false && 
                                              variantiGlobali.length > 0;

                  return (
                    <li key={item.id} className="cart-item">
                      <div>
                        <div className="item-name">
                          {item.nome} {item.piattoIndex > 1 ? `${item.piattoIndex}` : ''}
                        </div>
                        <div className="item-meta">
                          {item.quantita} × € {item.prezzo.toFixed(2)}
                          {item.varianti && item.varianti.length > 0 && mostraTastoVarianti && (
                            <div className="varianti-list">
                              {item.varianti.map(v => (
                                <div key={v.id} className={`variante-item ${v.tipo}`}>
                                  {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                                  {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="item-subtotale">
                          € {(
                            (item.prezzo * item.quantita) + 
                            (calcolaCostoVarianti(item.varianti) * item.quantita)
                          ).toFixed(2)}
                        </div>

                        <div className="item-controls">
                          {mostraTastoVarianti && (
                            <button 
                              className="varianti-btn"
                              onClick={() => {
                                if (categoria && categorieImpostazioni[categoria] !== false && variantiGlobali.length > 0) {
                                  setProdottoSelezionato(item);
                                  setVariantiSelezionate([...(item.varianti || [])]);
                                  setModalVarianti(true);
                                }
                              }}
                              title="Aggiungi/rimuovi varianti"
                            >
                              Varianti
                            </button>
                          )}
                          
                          <button 
                            className="delete" 
                            onClick={() => rimuoviPiatto(item.id)}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="cart-footer">
                <div className="totale-line">
                  <span>Totale</span>
                  <strong>€ {totaleCarrello.toFixed(2)}</strong>
                </div>

                <button className="send-btn" onClick={inviaOrdine}>
                  Invia ordine
                </button>
              </div>
            </>
          )}
          
          {messaggio && (
            <div className={`msg ${
              messaggio.includes('✅') ? 'success' : 
              messaggio.includes('❌') ? 'error' : 'warning'
            }`}>
              {messaggio}
            </div>
          )}
        </aside>
      )}

      {modalVarianti && prodottoSelezionato && (
        <div className="modal-backdrop">
          <div className="modal-varianti">
            <div className="modal-header">
              <h3>Varianti per: {prodottoSelezionato.nome}</h3>
              <button className="close" onClick={() => setModalVarianti(false)}>X</button>
            </div>
            
            <div className="modal-body">
              <p className="info-text">
                Seleziona le varianti da applicare a questo piatto:
              </p>
              
              <div className="varianti-disponibili">
                {variantiGlobali.length === 0 ? (
                  <p className="nessuna-variante">Nessuna variante disponibile</p>
                ) : (
                  variantiGlobali.map(variante => (
                    <div 
                      key={variante.id} 
                      className={`variante-option ${
                        variantiSelezionate.find(v => v.id === variante.id) ? 'selected' : ''
                      }`}
                    >
                      <div className="variante-info">
                        <span className="variante-nome">{variante.nome}</span>
                        <span className={`variante-tipo ${variante.tipo}`}>
                          {variante.tipo === 'aggiunta' 
                            ? `+ €${variante.costo.toFixed(2)}` 
                            : 'Rimozione'}
                        </span>
                      </div>
                      
                      <div className="variante-controls">
                        {variantiSelezionate.find(v => v.id === variante.id) ? (
                          <button 
                            className="btn-rimuovi"
                            onClick={() => rimuoviVariante(variante.id)}
                          >
                            ➖
                          </button>
                        ) : (
                          <button 
                            className="btn-aggiungi"
                            onClick={() => aggiungiVariante(variante)}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="varianti-selezionate">
                <h4>Varianti selezionate per questo piatto:</h4>
                {variantiSelezionate.length === 0 ? (
                  <p className="nessuna-selezione">Nessuna variante selezionata</p>
                ) : (
                  <ul>
                    {variantiSelezionate.map(v => (
                      <li key={v.id} className={`variante-selezionata ${v.tipo}`}>
                        <span>
                          {v.tipo === 'aggiunta' ? '➕' : '➖'} {v.nome}
                          {v.tipo === 'aggiunta' && ` (+€${v.costo.toFixed(2)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="modal-buttons">
                <button className="btn-annulla1" onClick={() => setModalVarianti(false)}>
                  Annulla
                </button>
                <button className="btn-conferma" onClick={confermaVarianti}>
                  Conferma Varianti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostraCopertoModal && copertoAttivo && !tavoloOccupato && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Inserisci numero di persone</h3>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={numeroPersone}
              onChange={(e) => setNumeroPersone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="ok" onClick={confermaCoperto}>Conferma</button>
            </div>
            <h3 style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Prezzo coperto per persona: € {prezzoCoperto.toFixed(2)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}