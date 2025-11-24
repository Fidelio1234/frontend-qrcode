import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './OperatorePage.css';

function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}


export default function OperatorePage() {
  const [ordini, setOrdini] = useState([]);
  const [mostraModalChiusura, setMostraModalChiusura] = useState(false);
  const [mostraModalConfermaChiusura, setMostraModalConfermaChiusura] = useState(false);
  const [messaggioSuccesso, setMessaggioSuccesso] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const query = useQuery();
  const tavoloFiltro = query.get('tavolo');

  const tavoloCorrente = tavoloFiltro && tavoloFiltro !== 'null' ? tavoloFiltro : null;
  const isAreaOperatore = !tavoloCorrente;
  const isChiusuraTavolo = !!tavoloCorrente;

















const caricaOrdini = useCallback(() => {
  console.log('🔍 DEBUG: Chiamando /api/ordini per tavolo:', tavoloCorrente);
  


  
  fetch('https://qrcode-finale.onrender.com/api/ordini')
    .then(res => {
      if (!res.ok) throw new Error('Error loading orders');
      return res.json();
    })
    .then(data => {
      console.log('📊 DATI RICEVUTI DAL SERVER:');
      data.forEach(o => {
        console.log(`   Tavolo ${o.tavolo}: ${o.dataOra} (ID: ${o.id})`);
      });
      setOrdini(data);
    })
    .catch(err => {
      console.error('❌ Error loading orders:', err);
      setOrdini([]);
    });
}, [tavoloCorrente]); // ⬅️ AGGIUNGI tavoloCorrente QUI

const caricaOrdiniCompleti = useCallback(() => {
  console.log('🔍 DEBUG: Chiamando /api/ordini/completo');
  
  fetch('https://qrcode-finale.onrender.com/api/ordini/completo')
    .then(res => {
      if (!res.ok) throw new Error('Error loading complete orders');
      return res.json();
    })
    .then(data => {
      console.log('📋 Ordini COMPLETI ricevuti:', data.length);
      
      const ordiniOrdinati = data.sort((a, b) => {
        const dataA = new Date(a.timestamp || a.chiusoIl || a.dataOra);
        const dataB = new Date(b.timestamp || b.chiusoIl || b.dataOra);
        return dataB - dataA;
      });
      
      setOrdini(ordiniOrdinati);
    })
    .catch(err => {
      console.error('❌ Error loading complete orders:', err);
      setOrdini([]);
    });
}, []); // ⬅️ Qui non serve tavoloCorrente











  const evadiOrdine = useCallback((id) => {
    fetch(`https://qrcode-finale.onrender.com/api/ordini/${id}/evaso`, { 
      method: 'POST' 
    })
      .then(res => {
        if (!res.ok) throw new Error('Error marking order as completed');
        caricaOrdini();
      })
      .catch(err => {
        console.error('❌ Error completing order:', err);
        alert('Error marking order as completed');
      });
  }, [caricaOrdini]);

  const verificaChiusuraTavolo = useCallback(() => {
    if (!tavoloCorrente) {
      alert('Select a table to close orders.');
      return;
    }

    const ordiniDelTavolo = ordini.filter(o => o.tavolo.toString() === tavoloCorrente);
    if (ordiniDelTavolo.length === 0) {
      alert(`No orders for table ${tavoloCorrente}.`);
      return;
    }

    const ordiniNonEvasi = ordiniDelTavolo.filter(o => o.stato !== 'evaso' && o.stato !== 'chiuso');
    
    if (ordiniNonEvasi.length > 0) {
      setMostraModalChiusura(true);
    } else {
      setMostraModalConfermaChiusura(true);
    }
  }, [tavoloCorrente, ordini]);

  const confermaChiusuraTavolo = useCallback(() => {
    console.log('🔄 Attempting to close table:', tavoloCorrente);
    
    fetch(`https://qrcode-finale.onrender.com/api/ordini/tavolo/${tavoloCorrente}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error in server response');
        }
        return response.json();
      })
      .then(data => {
        console.log('✅ Table closure response:', data);
        caricaOrdini();
        setMostraModalConfermaChiusura(false);
        
        localStorage.removeItem(`carrello_${tavoloCorrente}`);
        localStorage.removeItem(`copertoConfermato_${tavoloCorrente}`);
        localStorage.removeItem(`numeroPersone_${tavoloCorrente}`);
        
        localStorage.setItem(`carrello_${tavoloCorrente}`, '[]');
        localStorage.setItem(`copertoConfermato_${tavoloCorrente}`, 'false');
        
        console.log('💾 Table closed - localStorage cleaned');
        window.dispatchEvent(new Event('storage'));
        
        setMessaggioSuccesso(`Table ${tavoloCorrente} closed! Orders have been archived.`);
      })
      .catch(error => {
        console.error('❌ Error closing table:', error);
        setMostraModalConfermaChiusura(false);
        alert('Error closing table: ' + error.message);
      });
  }, [tavoloCorrente, caricaOrdini]);

  const chiudiTavolo = useCallback(() => {
    verificaChiusuraTavolo();
  }, [verificaChiusuraTavolo]);










// FUNZIONE CORRETTA

// ✅ FUNZIONE STAMPA TOTALE - VERSIONE ALTERNATIVA (se l'endpoint non esiste)
const stampaTotaleTavolo = useCallback(async () => {
  if (!tavoloCorrente) {
    alert('Seleziona un tavolo per stampare il totale');
    return;
  }

  try {
    console.log(`🖨️ Richiesta stampa totale tavolo ${tavoloCorrente}...`);
    
    // 1. Recupera gli ordini del tavolo
    const response = await fetch(`https://qrcode-finale.onrender.com/api/ordini/tavolo/${tavoloCorrente}`);
    const ordiniTavolo = await response.json();
    
    if (!ordiniTavolo || ordiniTavolo.length === 0) {
      alert(`Nessun ordine trovato per il tavolo ${tavoloCorrente}`);
      return;
    }
    
    // 2. Calcola il totale
    const totale = ordiniTavolo.reduce((tot, ord) => tot + ord.ordinazione.reduce((sum, item) => 
      sum + (item.prezzo * item.quantità), 0), 0);
    
    console.log('📊 Dati calcolati:', {
      tavolo: tavoloCorrente,
      ordini: ordiniTavolo.length,
      totale: totale
    });
    
    // 3. Invia alla stampante LOCALE
    const stampaResponse = await fetch('http://localhost:3002/api/stampa-conto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ordini: ordiniTavolo,
        tavolo: tavoloCorrente,
        totale: totale
      })
    });
    
    const stampaResult = await stampaResponse.json();
    
    if (stampaResult.success) {
      console.log('✅ Totale stampato con successo!');
      setMessaggioSuccesso(`✅ Totale tavolo ${tavoloCorrente} stampato! Importo: € ${totale.toFixed(2)}`);
    } else {
      throw new Error(stampaResult.error || 'Errore durante la stampa');
    }
    
  } catch (error) {
    console.error('❌ Errore stampa totale:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
      alert('❌ Stampante non disponibile. Controlla che il servizio di stampa locale sia in esecuzione sulla porta 3002.');
    } else {
      alert('❌ Errore stampa totale: ' + error.message);
    }
  }
}, [tavoloCorrente]);











// FUNZIONE CON STAMPA TAVOLO FILTRO CHIUSI







// ✅ USE EFFECT CORRETTO - FIX AUTO-EVASIONE
/*useEffect(() => {
  console.log('🔄 Caricamento ordini - Modalità:', isAreaOperatore ? 'Operatore' : 'Tavolo ' + tavoloCorrente);
  
  if (isAreaOperatore) {
    caricaOrdiniCompleti();
    
    // ✅ SOLO AREA OPERATORE: refresh ogni 10 secondi
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh area operatore');
      caricaOrdiniCompleti();
    }, 10000);
    
    return () => clearInterval(interval);
  } else {
    // ✅ TAVOLO SPECIFICO: carica SOLO UNA VOLTA
    console.log('📋 Caricamento una tantum per tavolo:', tavoloCorrente);
    caricaOrdini();
    
    // ❌ NESSUN INTERVAL PER TAVOLI SPECIFICI
    return () => {}; // Cleanup vuoto
  }
}, [isAreaOperatore, tavoloCorrente, caricaOrdini, caricaOrdiniCompleti]);

*/




// ✅ USE EFFECT CORRETTO - AUTO-REFRESH IN TUTTE LE SITUAZIONI
useEffect(() => {
  console.log('🔄 Caricamento ordini - Modalità:', isAreaOperatore ? 'Operatore' : 'Tavolo ' + tavoloCorrente);
  
  // ✅ FUNZIONE PER CARICARE GLI ORDINI CORRETTI
  const caricaOrdiniCorretti = () => {
    if (isAreaOperatore) {
      caricaOrdiniCompleti();
    } else {
      caricaOrdini();
    }
  };
  
  // ✅ CARICA SUBITO
  caricaOrdiniCorretti();
  
  // ✅ AUTO-REFRESH OGNI 5 SECONDI IN TUTTE LE SITUAZIONI
  const interval = setInterval(() => {
    console.log('🔄 Auto-refresh attivo');
    caricaOrdiniCorretti();
  }, 5000); // ✅ 5 secondi invece di 10
  
  return () => clearInterval(interval);
}, [isAreaOperatore, tavoloCorrente, caricaOrdini, caricaOrdiniCompleti]);



  useEffect(() => {
    if (messaggioSuccesso) {
      const timer = setTimeout(() => setMessaggioSuccesso(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [messaggioSuccesso]);

  // ✅ FILTER ORDERS
  const ordiniFiltrati = useMemo(() => {
    return tavoloCorrente
      ? ordini.filter(o => o.tavolo.toString() === tavoloCorrente)
      : ordini.filter(o => {
          if (filtroStato === 'tutti') return true;
          return o.stato === filtroStato;
        });
  }, [tavoloCorrente, ordini, filtroStato]);

  // ✅ USE MEMO PER ORDINI PER TAVOLO
  const ordiniPerTavolo = useMemo(() => {
    const result = {};
    if (isAreaOperatore && filtroStato === 'chiuso') {
      ordiniFiltrati.forEach(ordine => {
        if (!result[ordine.tavolo]) {
          result[ordine.tavolo] = [];
        }
        result[ordine.tavolo].push(ordine);
      });
    }
    return result;
  }, [isAreaOperatore, filtroStato, ordiniFiltrati]);

  const ordiniNonEvasi = useMemo(() => 
    ordiniFiltrati.filter(o => o.stato !== 'evaso' && o.stato !== 'chiuso'),
    [ordiniFiltrati]
  );

  const totaleTavolo = useMemo(() => 
    ordiniFiltrati.reduce((totale, ordine) => {
      const totaleOrdine = ordine.ordinazione.reduce((acc, item) => acc + (item.prezzo * item.quantità), 0);
      return totale + totaleOrdine;
    }, 0),
    [ordiniFiltrati]
  );

  // ✅ FUNCTION TO GET TABLE TOTAL (for closed tables) - CALCOLO DIRETTO
  const getTotaleTavoloChiuso = useCallback((tavolo) => {
    const ordiniTavolo = ordiniPerTavolo[tavolo] || [];
    const totale = ordiniTavolo.reduce((totale, ordine) => {
      const totaleOrdine = ordine.ordinazione.reduce((sum, item) => {
        const quantita = item.quantità || 1;
        const prezzo = parseFloat(item.prezzo) || 0;
        return sum + (prezzo * quantita);
      }, 0);
      return totale + totaleOrdine;
    }, 0);
    
    console.log(`💰 Tavolo ${tavolo}: €${totale.toFixed(2)}`);
    return parseFloat(totale.toFixed(2));
  }, [ordiniPerTavolo]);

  // DEBUG: Verifica che i totali vengano calcolati
  console.log('🔍 DEBUG TAVOLI CHIUSI:', {
    numeroTavoli: Object.keys(ordiniPerTavolo).length,
    primoTavolo: Object.keys(ordiniPerTavolo)[0],
    ordiniPrimoTavolo: ordiniPerTavolo[Object.keys(ordiniPerTavolo)[0]]?.length,
    totalePrimoTavolo: Object.keys(ordiniPerTavolo)[0] ? getTotaleTavoloChiuso(Object.keys(ordiniPerTavolo)[0]) : 0
  });

 /*const formattaElementoOrdine = useCallback((item, index) => {
  // ✅ PULISCI IL NOME DEL PRODOTTO - RIMUOVI "x1" DA "COPERTTO"
  const nomeProdottoPulito = item.prodotto.replace(/\s*x1\s*$/i, '');
  
  if (isAreaOperatore) {
    return (
      <li key={index} className="ordine-riga">
        <span className="quantita">{item.quantità} x</span>
        <span className="prodotto">{nomeProdottoPulito}</span>
        <span className="prezzo">€ {(item.prezzo * item.quantità).toFixed(2)}</span>
      </li>
    );
  } else {
    return (
      <li key={index} className="ordine-riga">
        <span className="quantita">{item.quantità} x</span>
        <span className="prodotto">{nomeProdottoPulito}</span>
        <span className="prezzo">€ {(item.prezzo * item.quantità).toFixed(2)}</span>
      </li>
    );
  }
}, [isAreaOperatore]);







*/



const formattaElementoOrdine = useCallback((item, index) => {
  // ✅ CONTROLLI DI SICUREZZA COMPLETI
  if (!item) return null;
  
  const nomeOriginale = item.prodotto || '';
  const quantitaOriginale = item.quantità || 1;
  const prezzoOriginale = item.prezzo || 0;
  
  let nomeProdotto = nomeOriginale;
  let quantita = quantitaOriginale;
  
  // ✅ GESTIONE COPERTTO
  if (nomeOriginale.toLowerCase().includes('coperto')) {
    const match = nomeOriginale.match(/x\s*(\d+)/i);
    if (match) {
      quantita = parseInt(match[1]) || quantitaOriginale;
      nomeProdotto = 'Coperto';
    } else {
      nomeProdotto = 'Coperto';
    }
  } else {
    // Prodotti normali
    nomeProdotto = nomeOriginale.replace(/\s*x\s*\d+\s*$/i, '');
  }
  
  return (
    <li key={index} className="ordine-riga">
      <span className="quantita">{quantita} x</span>
      <span className="prodotto">{nomeProdotto}</span>
      <span className="prezzo">€ {prezzoOriginale.toFixed(2)}</span>
    </li>
  );
}, []);



  const getStatoColore = useCallback((stato) => {
    switch(stato) {
      case 'in_attesa': return '#3498db';
      case 'evaso': return '#27ae60';
      case 'chiuso': return '#95a5a6';
      default: return '#3498db';
    }
  }, []);

  const getStatoTesto = useCallback((stato) => {
    switch(stato) {
      case 'in_attesa': return 'IN ATTESA';
      case 'evaso': return 'COMPLETATO';
      case 'chiuso': return 'CHIUSO';
      default: return stato;
    }
  }, []);

  return (
    <div className={`operatore-container ${isAreaOperatore ? 'area-operatore' : 'chiusura-tavolo'}`}>
      <h2>
        {tavoloCorrente ? `Ordini - Tavolo ${tavoloCorrente}` : 'Area Operatore - Tutti gli Ordini'}
      </h2>

      {messaggioSuccesso && (
        <div className="messaggio-successo">
          {messaggioSuccesso}
        </div>
      )}

      {isAreaOperatore && (
        <div className="filtri-stato">
       
          <button 
            className={`filtro-btn ${filtroStato === 'in_attesa' ? 'attivo' : ''}`}
            onClick={() => setFiltroStato('in_attesa')}
          >
            In Attesa
          </button>
          <button 
            className={`filtro-btn ${filtroStato === 'evaso' ? 'attivo' : ''}`}
            onClick={() => setFiltroStato('evaso')}
          >
            Completati
          </button>
          <button 
            className={`filtro-btn ${filtroStato === 'chiuso' ? 'attivo' : ''}`}
            onClick={() => setFiltroStato('chiuso')}
          >
            Chiusi
          </button>
        </div>
      )}








   {tavoloCorrente && (
  <div className="tavolo-header">
    <button className="button-chiudi" onClick={chiudiTavolo}>
      Chiudi Tavolo {tavoloCorrente}
    </button>

    {/* ✅ NUOVO PULSANTE STAMPA TOTALE */}
    <button 
      className="button-stampa-totale" 
      onClick={stampaTotaleTavolo}
      disabled={ordiniFiltrati.length === 0}
    >
      🖨️ Stampa Totale Tavolo
    </button>

    {ordiniNonEvasi.length > 0 && (
      <div className="avviso-non-evasi">
        ⚠️ {ordiniNonEvasi.length} ordine/i non completato/i
      </div>
    )}
  </div>
)}
      {ordiniFiltrati.length === 0 && (
        <p className="nessun-ordine">
          {isAreaOperatore ? 'Nessun ordine trovato' : 'Nessun ordine attivo per questo tavolo'}
        </p>
      )}

      <div className="ordini-scroll">
        <ul className="ordini-list">
          {/* ✅ SPECIAL VIEW FOR CLOSED TABLES - GROUPED BY TABLE */}
          {isAreaOperatore && filtroStato === 'chiuso' ? (
            Object.keys(ordiniPerTavolo).map(tavolo => {
              const ordiniTavolo = ordiniPerTavolo[tavolo];
              const totaleTavolo = getTotaleTavoloChiuso(tavolo);
              
              return (
                <li key={tavolo} className="tavolo-chiuso-group">
                  <div className="tavolo-chiuso-header">
                    <h3>Tavolo {tavolo} - Chiuso</h3>
                    <div className='button-stampa'>
            
          </div>

                    <div className="totale-tavolo-chiuso">
                      💰 Totale: € {totaleTavolo.toFixed(2)}
                      <small style={{display: 'block', fontSize: '0.8rem', opacity: 0.8}}>
                        ({ordiniTavolo.length} ordini)
                      </small>
                    </div>
                  </div>
                  
                  {ordiniTavolo.map(o => (
                    <div key={o.id} className="ordine-item chiuso" style={{ borderLeftColor: getStatoColore(o.stato) }}>
                      <div className="ordine-header">
                        <div className="ordine-info">
                          <span className="ordine-stato" style={{ color: getStatoColore(o.stato) }}>
                            {getStatoTesto(o.stato)}
                          </span>
                          {o.dataOra && <span className="ordine-data">• Aperto {o.dataOra}</span>}
                          {o.chiusoIl && <span className="ordine-data">• Chiuso: {o.chiusoIl}</span>}
                        </div>
                      </div>
                      
                      <ul className="ordine-dettagli">
                        {o.ordinazione.map((item, i) => formattaElementoOrdine(item, i))}
                      </ul>
                      
                      <div className="ordine-totale">
                        Totale Ordine: € {o.totale ? o.totale.toFixed(2) : 
                          o.ordinazione.reduce((sum, item) => sum + (item.prezzo * item.quantità), 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </li>
              );
            })
          ) : (
            // ✅ NORMAL VIEW FOR OTHER FILTERS
            ordiniFiltrati.map(o => (
              <li key={o.id} className="ordine-item" style={{ borderLeftColor: getStatoColore(o.stato) }}>
                <div className="ordine-header">
                  <div className="ordine-info">
                    <span className="tavolo-numero">Tavolo {o.tavolo}</span>
                    <span className="ordine-stato" style={{ color: getStatoColore(o.stato) }}>
                      {getStatoTesto(o.stato)}
                    </span>
                    {o.dataOra && <span className="ordine-data">• {o.dataOra}</span>}
                  </div>
                  {(o.stato === 'in_attesa' || o.stato === 'stampato') && (
                    <span className="badge-non-evaso">DA COMPLETARE</span>
                  )}
                </div>
                
                <ul className="ordine-dettagli">
                  {o.ordinazione.map((item, i) => formattaElementoOrdine(item, i))}
                </ul>
                
                {o.chiusoIl && (
                  <div className="info-chiusura">
                    Tavolo chiuso il: {o.chiusoIl}
                  </div>
                )}
                
                {(o.stato === 'in_attesa' || o.stato === 'stampato') && (
                  <button className="button-evaso" onClick={() => evadiOrdine(o.id)}>
                    Segna come completato
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {isChiusuraTavolo && ordiniFiltrati.length > 0 && (
        <div className="totale-tavolo">
          Totale Tavolo {tavoloCorrente}: € {totaleTavolo.toFixed(2)}
        </div>
      )}

      {/* Modals remain the same */}
      {mostraModalChiusura && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Impossibile Chiudere il Tavolo <strong>{tavoloCorrente}</strong></h3>
            <p>Ci sono ancora <strong>{ordiniNonEvasi.length} ordine/i non completato/i</strong> per il tavolo {tavoloCorrente}.</p>
            <p>Prima di chiudere il tavolo, assicurati di aver completato tutti gli ordini.</p>
            
            <div className="ordini-non-evasi-lista">
              <h4>Ordini da completare:</h4>
              <ul>
                {ordiniNonEvasi.map(ordine => (
                  <li key={ordine.id}>
                    Ordine - {ordine.ordinazione.length} articoli
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-buttons">
              <button 
                className="button-ok"
                onClick={() => setMostraModalChiusura(false)}
              >
                Ho Capito
              </button>
            </div>
          </div>
        </div>
      )}

      {mostraModalConfermaChiusura && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Conferma Chiusura Tavolo <strong>{tavoloCorrente}</strong></h3>
           
            <p>✅ Gli ordini verranno archiviati nell'area operatore sezione "Chiusi".</p>
            <p>📋 Ricordati di stampare il totale prima di chiudere il Tavolo <strong>{tavoloCorrente}</strong>.</p>
            
            {ordiniFiltrati.length > 0 && (
              <div className="dettagli-chiusura">
                <h4>Dettagli ordini che verranno archiviati:</h4>
                <ul>
                  <li>Totale ordini: {ordiniFiltrati.length}</li>
                  <li>Importo totale: € {totaleTavolo.toFixed(2)}</li>
                  <li>Ordini completati: {ordiniFiltrati.filter(o => o.stato === 'evaso').length}</li>
                  <li>Ordini in attesa: {ordiniFiltrati.filter(o => o.stato === 'in_attesa').length}</li>
                </ul>
              </div>
            )}

            <div className="modal-buttons">
              <button 
                className="button-annulla"
                onClick={() => setMostraModalConfermaChiusura(false)}
              >
                Annulla
              </button>
              <button 
                className="button-conferma"
                onClick={confermaChiusuraTavolo}
              >
                Conferma Chiusura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


