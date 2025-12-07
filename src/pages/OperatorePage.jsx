/*import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    const totaleOrdine = ordine.ordinazione.reduce((acc, item) => {
      // ✅ CORREGGI IL CALCOLO PER COPERTTO
      if (item.prodotto.toLowerCase().includes('coperto')) {
        const match = item.prodotto.match(/x\s*(\d+)/i);
        if (match) {
          const quantitaCoperto = parseInt(match[1]);
          return acc + (item.prezzo * quantitaCoperto); // €2.00 × 6 = €12.00
        }
      }
      return acc + (item.prezzo * item.quantità);
    }, 0);
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

 


const formattaElementoOrdine = useCallback((item, index) => {
  let nomeProdotto = item.prodotto;
  let quantita = item.quantità;
  let prezzoUnitario = item.prezzo || 0;
  
  // ✅ GESTIONE SPECIALE PER COPERTTO
  if (item.prodotto && item.prodotto.toLowerCase().includes('coperto')) {
    const match = item.prodotto.match(/x\s*(\d+)/i);
    if (match) {
      quantita = parseInt(match[1]);
      nomeProdotto = 'Coperto';
      // ✅ MOLTIPLICA IL PREZZO UNITARIO PER LA QUANTITÀ
      prezzoUnitario = prezzoUnitario * quantita;
    } else {
      nomeProdotto = 'Coperto';
    }
  } else {
    // Prodotti normali - pulisci il nome
    nomeProdotto = item.prodotto.replace(/\s*x\s*\d+\s*$/i, '');
  }
  
  return (
    <li key={index} className="ordine-riga">
      <span className="quantita">{quantita} x</span>
      <span className="prodotto">{nomeProdotto}</span>
      <span className="prezzo">€ {prezzoUnitario.toFixed(2)}</span>
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

    {/* ✅ NUOVO PULSANTE STAMPA TOTALE *//*}
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
          {/* ✅ SPECIAL VIEW FOR CLOSED TABLES - GROUPED BY TABLE *//*}
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

      {/* Modals remain the same *//*}
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



*/





































/*import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  }, [tavoloCorrente]);

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
  }, []);

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

  // ✅ FUNZIONE STAMPA TOTALE
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
      
      // 2. Calcola il totale includendo le varianti
      const totale = ordiniTavolo.reduce((tot, ord) => {
        const totaleOrdine = ord.ordinazione.reduce((sum, item) => {
          // ✅ CALCOLO BASE PRODOTTO
          let prezzoBase = item.prezzo || 0;
          const quantita = item.quantità || 1;
          
          // ✅ AGGIUNGI COSTO VARIANTI SE PRESENTI
          if (item.varianti && item.varianti.length > 0) {
            const costoVarianti = item.varianti
              .filter(v => v.tipo === 'aggiunta')
              .reduce((sumVarianti, v) => sumVarianti + (v.costo || 0), 0);
            prezzoBase += costoVarianti;
          }
          
          return sum + (prezzoBase * quantita);
        }, 0);
        return tot + totaleOrdine;
      }, 0);
      
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

  // ✅ USE EFFECT CORRETTO - AUTO-REFRESH
  useEffect(() => {
    console.log('🔄 Caricamento ordini - Modalità:', isAreaOperatore ? 'Operatore' : 'Tavolo ' + tavoloCorrente);
    
    const caricaOrdiniCorretti = () => {
      if (isAreaOperatore) {
        caricaOrdiniCompleti();
      } else {
        caricaOrdini();
      }
    };
    
    caricaOrdiniCorretti();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh attivo');
      caricaOrdiniCorretti();
    }, 5000);
    
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

  // ✅ CALCOLO TOTALE TAVOLO CON VARIANTI
  const totaleTavolo = useMemo(() => 
    ordiniFiltrati.reduce((totale, ordine) => {
      const totaleOrdine = ordine.ordinazione.reduce((acc, item) => {
        // ✅ CORREGGI IL CALCOLO PER COPERTTO
        if (item.prodotto && item.prodotto.toLowerCase().includes('coperto')) {
          const match = item.prodotto.match(/x\s*(\d+)/i);
          if (match) {
            const quantitaCoperto = parseInt(match[1]);
            return acc + (item.prezzo * quantitaCoperto);
          }
        }
        
        // ✅ CALCOLO PRODOTTI NORMALI CON VARIANTI
        let prezzoProdotto = item.prezzo || 0;
        
        // ✅ AGGIUNGI COSTO VARIANTI SE PRESENTI
        if (item.varianti && item.varianti.length > 0) {
          const costoVarianti = item.varianti
            .filter(v => v.tipo === 'aggiunta')
            .reduce((sum, v) => sum + (v.costo || 0), 0);
          prezzoProdotto += costoVarianti;
        }
        
        return acc + (prezzoProdotto * item.quantità);
      }, 0);
      return totale + totaleOrdine;
    }, 0),
    [ordiniFiltrati]
  );

  // ✅ FUNCTION TO GET TABLE TOTAL (for closed tables) - INCLUSIVE DI VARIANTI
  const getTotaleTavoloChiuso = useCallback((tavolo) => {
    const ordiniTavolo = ordiniPerTavolo[tavolo] || [];
    const totale = ordiniTavolo.reduce((totale, ordine) => {
      const totaleOrdine = ordine.ordinazione.reduce((sum, item) => {
        const quantita = item.quantità || 1;
        let prezzo = parseFloat(item.prezzo) || 0;
        
        // ✅ AGGIUNGI COSTO VARIANTI
        if (item.varianti && item.varianti.length > 0) {
          const costoVarianti = item.varianti
            .filter(v => v.tipo === 'aggiunta')
            .reduce((sumVarianti, v) => sumVarianti + (v.costo || 0), 0);
          prezzo += costoVarianti;
        }
        
        return sum + (prezzo * quantita);
      }, 0);
      return totale + totaleOrdine;
    }, 0);
    
    return parseFloat(totale.toFixed(2));
  }, [ordiniPerTavolo]);

  // ✅ FORMATA ELEMENTO ORDINE CON VARIANTI
  const formattaElementoOrdine = useCallback((item, index) => {
    let nomeProdotto = item.prodotto;
    let quantita = item.quantità;
    let prezzoUnitario = item.prezzo || 0;
    
    // ✅ GESTIONE SPECIALE PER COPERTTO
    if (item.prodotto && item.prodotto.toLowerCase().includes('coperto')) {
      const match = item.prodotto.match(/x\s*(\d+)/i);
      if (match) {
        quantita = parseInt(match[1]);
        nomeProdotto = 'Coperto';
        
        prezzoUnitario = prezzoUnitario * quantita;
      } else {
        nomeProdotto = 'Coperto';
      }
    } else {
      // Prodotti normali - pulisci il nome
      nomeProdotto = item.prodotto.replace(/\s*x\s*\d+\s*$/i, '');
    }
    
    // ✅ VARIANTI ASSOCIATE AL PRODOTTO
    const varianti = item.varianti || [];
    
    return (
      <li key={index} className="ordine-riga">
        <div className="prodotto-principale">
          <span className="quantita">{quantita} x</span>
          <span className="prodotto">{nomeProdotto}</span>
          <span className="prezzo">€ {prezzoUnitario.toFixed(2)}</span>
        </div>
        
        {/* ✅ VISUALIZZA VARIANTI *//*}
        {varianti.length > 0 && (
          <div className="varianti-container">
            {varianti.map(variante => (
              <div 
                key={`${index}-${variante.id || variante.nome}`} 
                className={`variante-item ${variante.tipo}`}
              >
                <span className="variante-icon">
                  {variante.tipo === 'aggiunta' ? '➕' : '➖'}
                </span>
                <span className="variante-nome">{variante.nome}</span>
                {variante.tipo === 'aggiunta' && variante.costo > 0 && (
                  <span className="variante-costo">+€{variante.costo.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </li>
    );
  }, []);

  // ✅ CALCOLA PREZZO PRODOTTO CON VARIANTI
  const calcolaPrezzoProdottoConVarianti = useCallback((item) => {
    let prezzoBase = item.prezzo || 0;
    
    // ✅ AGGIUNGI COSTO VARIANTI DI TIPO "AGGIUNTA"
    if (item.varianti && item.varianti.length > 0) {
      const costoVarianti = item.varianti
        .filter(v => v.tipo === 'aggiunta')
        .reduce((sum, v) => sum + (v.costo || 0), 0);
      prezzoBase += costoVarianti;
    }
    
    return prezzoBase;
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
          {/* ✅ SPECIAL VIEW FOR CLOSED TABLES - GROUPED BY TABLE *//*}
          {isAreaOperatore && filtroStato === 'chiuso' ? (
            Object.keys(ordiniPerTavolo).map(tavolo => {
              const ordiniTavolo = ordiniPerTavolo[tavolo];
              const totaleTavolo = getTotaleTavoloChiuso(tavolo);
              
              return (
                <li key={tavolo} className="tavolo-chiuso-group">
                  <div className="tavolo-chiuso-header">
                    <h3>Tavolo {tavolo} - Chiuso</h3>
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
                          o.ordinazione.reduce((sum, item) => {
                            const prezzoConVarianti = calcolaPrezzoProdottoConVarianti(item);
                            return sum + (prezzoConVarianti * item.quantità);
                          }, 0).toFixed(2)}
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
                
                <div className="ordine-totale-riga">
                  <span>Totale ordine:</span>
                  <strong>
                    € {o.ordinazione.reduce((sum, item) => {
                      const prezzoConVarianti = calcolaPrezzoProdottoConVarianti(item);
                      return sum + (prezzoConVarianti * item.quantità);
                    }, 0).toFixed(2)}
                  </strong>
                </div>
                
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

      {/* Modals remain the same *//*}
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



*/


























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
  }, [tavoloCorrente]);

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
  }, []);

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

  const stampaTotaleTavolo = useCallback(async () => {
    if (!tavoloCorrente) {
      alert('Seleziona un tavolo per stampare il totale');
      return;
    }

    try {
      console.log(`🖨️ Richiesta stampa totale tavolo ${tavoloCorrente}...`);
      
      const response = await fetch(`https://qrcode-finale.onrender.com/api/ordini/tavolo/${tavoloCorrente}`);
      const ordiniTavolo = await response.json();
      
      if (!ordiniTavolo || ordiniTavolo.length === 0) {
        alert(`Nessun ordine trovato per il tavolo ${tavoloCorrente}`);
        return;
      }
      
      const totale = ordiniTavolo.reduce((tot, ord) => {
        const totaleOrdine = ord.ordinazione.reduce((sum, item) => {
          let prezzoProdotto = item.prezzo || 0;
          
          // ✅ AGGIUNGI COSTO VARIANTI
          if (item.varianti && item.varianti.length > 0) {
            const costoVarianti = item.varianti
              .filter(v => v.tipo === 'aggiunta')
              .reduce((sumVarianti, v) => sumVarianti + (v.costo || 0), 0);
            prezzoProdotto += costoVarianti;
          }
          
          return sum + (prezzoProdotto * item.quantità);
        }, 0);
        return tot + totaleOrdine;
      }, 0);
      
      console.log('📊 Dati calcolati:', {
        tavolo: tavoloCorrente,
        ordini: ordiniTavolo.length,
        totale: totale
      });
      
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

  useEffect(() => {
    console.log('🔄 Caricamento ordini - Modalità:', isAreaOperatore ? 'Operatore' : 'Tavolo ' + tavoloCorrente);
    
    const caricaOrdiniCorretti = () => {
      if (isAreaOperatore) {
        caricaOrdiniCompleti();
      } else {
        caricaOrdini();
      }
    };
    
    caricaOrdiniCorretti();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh attivo');
      caricaOrdiniCorretti();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAreaOperatore, tavoloCorrente, caricaOrdini, caricaOrdiniCompleti]);

  useEffect(() => {
    if (messaggioSuccesso) {
      const timer = setTimeout(() => setMessaggioSuccesso(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [messaggioSuccesso]);

  const ordiniFiltrati = useMemo(() => {
    return tavoloCorrente
      ? ordini.filter(o => o.tavolo.toString() === tavoloCorrente)
      : ordini.filter(o => {
          if (filtroStato === 'tutti') return true;
          return o.stato === filtroStato;
        });
  }, [tavoloCorrente, ordini, filtroStato]);

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








  
  // ✅ FUNZIONE PER CALCOLARE IL TOTALE DI UN SINGOLO ORDINE CON VARIANTI
const calcolaTotaleOrdineCompleto = useCallback((ordinazione) => {
  return ordinazione.reduce((totale, item) => {
    let prezzoUnitario = item.prezzo || 0;
    let quantita = item.quantità || 1;
    
    // ✅ GESTIONE COPERTTO
    if (item.prodotto && item.prodotto.toLowerCase().includes('coperto')) {
      const match = item.prodotto.match(/x\s*(\d+)/i);
      if (match) {
        const numeroPersone = parseInt(match[1]);
        // Per il coperto, moltiplichiamo il prezzo unitario per il numero di persone
        return totale + (prezzoUnitario * numeroPersone);
      }
      return totale + prezzoUnitario;
    }
    
    // ✅ AGGIUNGI VARIANTI SE PRESENTI
    if (item.varianti && Array.isArray(item.varianti) && item.varianti.length > 0) {
      const costoVarianti = item.varianti.reduce((sum, variante) => {
        if (variante.tipo === 'aggiunta' && variante.costo > 0) {
          return sum + (parseFloat(variante.costo) || 0);
        }
        return sum;
      }, 0);
      prezzoUnitario += costoVarianti;
    }
    
    return totale + (prezzoUnitario * quantita);
  }, 0);
}, []);












  const totaleTavolo = useMemo(() => 
    ordiniFiltrati.reduce((totale, ordine) => {
      const totaleOrdine = calcolaTotaleOrdineCompleto(ordine.ordinazione);
      return totale + totaleOrdine;
    }, 0),
    [ordiniFiltrati, calcolaTotaleOrdineCompleto]
  );

  const getTotaleTavoloChiuso = useCallback((tavolo) => {
    const ordiniTavolo = ordiniPerTavolo[tavolo] || [];
    const totale = ordiniTavolo.reduce((totale, ordine) => {
      return totale + calcolaTotaleOrdineCompleto(ordine.ordinazione);
    }, 0);
    
    console.log(`💰 Tavolo ${tavolo}: €${totale.toFixed(2)}`);
    return parseFloat(totale.toFixed(2));
  }, [ordiniPerTavolo, calcolaTotaleOrdineCompleto]);












const formattaElementoOrdine = useCallback((item, index) => {
  let nomeProdotto = item.prodotto;
  let quantita = item.quantità || 1;
  let prezzoUnitario = item.prezzo || 0;
  
  // ✅ GESTIONE SPECIALE PER COPERTTO - CORRETTA
  if (item.prodotto && item.prodotto.toLowerCase().includes('coperto')) {
    // Estrai il numero dal nome (es: "Coperto x 4" -> 4)
    const match = item.prodotto.match(/x\s*(\d+)/i);
    if (match) {
      const numeroPersone = parseInt(match[1]);
      // Il prezzo unitario è per persona, ma nel carrello abbiamo un solo item
      // Quindi il prezzo totale è: prezzoUnitario * numeroPersone
      const prezzoTotaleCoperto = prezzoUnitario * numeroPersone;
      
      return (
        <li key={index} className="ordine-riga">
          <div className="prodotto-principale">
            <span className="quantita">{numeroPersone} x</span>
            <span className="prodotto">Coperto</span>
            <span className="prezzo">€ {prezzoTotaleCoperto.toFixed(2)}</span>
          </div>
          <div className="info-coperto">
            <small>(€ {prezzoUnitario.toFixed(2)} per persona)</small>
          </div>
        </li>
      );
    } else {
      // Se non trova il numero, mostra normalmente
      nomeProdotto = 'Coperto';
      quantita = 1;
    }
  } else {
    // Prodotti normali - pulisci il nome
    nomeProdotto = item.prodotto.replace(/\s*x\s*\d+\s*$/i, '');
  }
  
  // ✅ AGGIUNGI COSTO VARIANTI al prezzo unitario
  const varianti = item.varianti || [];
  let prezzoConVarianti = prezzoUnitario;
  
  if (varianti.length > 0) {
    const costoVarianti = varianti.reduce((somma, variante) => {
      if (variante.tipo === 'aggiunta' && variante.costo > 0) {
        return somma + (variante.costo || 0);
      }
      return somma;
    }, 0);
    prezzoConVarianti += costoVarianti;
  }
  
  // ✅ CALCOLA IL PREZZO TOTALE PER LA QUANTITÀ
  const prezzoTotale = prezzoConVarianti * quantita;
  
  return (
    <li key={index} className="ordine-riga">
      <div className="prodotto-principale">
        <span className="quantita">{quantita} x</span>
        <span className="prodotto">{nomeProdotto}</span>
        <span className="prezzo">€ {prezzoTotale.toFixed(2)}</span>
      </div>
      
      {/* ✅ VISUALIZZA VARIANTI */}
      {varianti.length > 0 && (
        <div className="varianti-container">
          {varianti.map((variante, idx) => (
            <div 
              key={`${index}-${variante.id || variante.nome || idx}`} 
              className={`variante-item ${variante.tipo}`}
            >
              <span className="variante-icon">
                {variante.tipo === 'aggiunta' ? '➕' : '➖'}
              </span>
              <span className="variante-nome">{variante.nome}</span>
              {variante.tipo === 'aggiunta' && variante.costo > 0 && (
                <span className="variante-costo">+€{variante.costo.toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
      )}
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
          {isAreaOperatore && filtroStato === 'chiuso' ? (
            Object.keys(ordiniPerTavolo).map(tavolo => {
              const ordiniTavolo = ordiniPerTavolo[tavolo];
              const totaleTavolo = getTotaleTavoloChiuso(tavolo);
              
              return (
                <li key={tavolo} className="tavolo-chiuso-group">
                  <div className="tavolo-chiuso-header">
                    <h3>Tavolo {tavolo} - Chiuso</h3>
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
                           {/*o.chiusoIl && <span className="ordine-data">• Aperto: {o.chiusoIl}</span>*/}
                          {o.dataOra && <span className="ordine-data">• Chiuso: {o.dataOra}</span>}
                         
                        </div>
                      </div>
                      
                      <ul className="ordine-dettagli">
                        {o.ordinazione.map((item, i) => formattaElementoOrdine(item, i))}
                      </ul>
                      
                      <div className="ordine-totale">
                        Totale Ordine: € {o.totale ? o.totale.toFixed(2) : 
                          calcolaTotaleOrdineCompleto(o.ordinazione).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </li>
              );
            })
          ) : (
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
                
                <div className="ordine-totale-riga">
                  <span>Totale ordine:</span>
                  <strong>
                    € {o.totale ? o.totale.toFixed(2) : 
                      calcolaTotaleOrdineCompleto(o.ordinazione).toFixed(2)}
                  </strong>
                </div>
                
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