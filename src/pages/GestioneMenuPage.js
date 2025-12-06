
// GestioneMenuPage.jsx
/*import React, { useState, useEffect } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  // Carica menu
  const caricaMenu = () => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(setMenu)
      .catch(() => setMenu([]));
  };

  // Carica coperto
  const caricaCoperto = () => {
    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        setCopertoAttivo(!!data.attivo);
        setPrezzoCoperto(data.prezzo !== undefined ? data.prezzo.toString() : '');
      })
      .catch(() => {
        setCopertoAttivo(false);
        setPrezzoCoperto('');
      });
  };

  // Aggiorna coperto sul server
  const aggiornaCoperto = (attivo, prezzo) => {
    fetch('https://qrcode-finale.onrender.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  };

  // Toggle coperto
  const toggleCoperto = () => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  };

  // Cambia prezzo coperto
  const cambiaPrezzoCoperto = (value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  };

  // Aggiungi nuovo prodotto
  const aggiungiProdotto = () => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, prezzo: parseFloat(prezzo), categoria: categoriaFinale })
    })
      .then(() => {
        setNome('');
        setPrezzo('');
       // setCategoria('');
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      });
  };

  // Messaggio temporaneo
  const mostraMessaggio = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  // Eliminazione categoria
  const eliminaCategoria = (cat) => {
    if (!window.confirm(`Sei sicuro di eliminare la categoria "${cat}" e tutti i suoi prodotti?`)) return;
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(cat)}`, { method: 'DELETE' })
      .then(() => {
        caricaMenu();
        mostraMessaggio(`Categoria "${cat}" eliminata!`);
      });
  };

  // Eliminazione prodotto
  const eliminaProdotto = (id) => {
    if (!window.confirm('Sei sicuro di eliminare questo prodotto?')) return;
    fetch(`https://qrcode-finale.onrender.com/api/menu/${id}`, { method: 'DELETE' })
      .then(() => {
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      });
  };

  // Apri modal modifica prodotto
  const apriModifica = (prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  };

  // Salva modifica prodotto
  const salvaModifica = () => {
    fetch(`https://qrcode-finale.onrender.com/api/menu/${modificaProdotto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: modificaNome, prezzo: parseFloat(modificaPrezzo) })
    })
      .then(() => {
        caricaMenu();
        setShowModal(false);
        mostraMessaggio('Prodotto modificato!');
      });
  };

  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, []);

  const categorie = [...new Set(menu.map(item => item.categoria))];

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* Aggiungi prodotto *//*}
      <div className="aggiungi-box">
        <h3>Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input type="text" placeholder="Nome pietanza" value={nome} onChange={e => setNome(e.target.value)} />
          <input type="number" placeholder="Prezzo" value={prezzo} onChange={e => setPrezzo(e.target.value)} />
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Seleziona categoria</option>
            {categorie.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input type="text" placeholder="Nuova categoria" value={nuovaCategoria} onChange={e => setNuovaCategoria(e.target.value)} />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* Gestione coperto *//*}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && <input type="number" placeholder="Prezzo coperto" value={prezzoCoperto} onChange={e => cambiaPrezzoCoperto(e.target.value)} />}
      </div>

      {/* Categorie e prodotti *//*}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => (
        <div key={cat} className="categoria-blocco">
          <div className="categoria-header">
            <h4>{cat}</h4>
            <div className="categoria-actions">
              <button className= "elimina-cat" onClick={() => eliminaCategoria(cat)}>Elimina Categoria</button>
            </div>
          </div>
          <ul>
            {menu.filter(item => item.categoria === cat).map(item => (
              <li key={item.id}>
                {item.nome} {item.prezzo.toFixed(2)}
                <div className="prod-actions">
                  <button className="modifica" onClick={() => apriModifica(item)}>Modifica</button>
                  <button className="ordina" onClick={() => eliminaProdotto(item.id)}>Elimina</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Modal modifica prodotto *//*}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Modifica Prodotto</h3>
            <input type="text" value={modificaNome} onChange={e => setModificaNome(e.target.value)} />
            <input type="number" value={modificaPrezzo} onChange={e => setModificaPrezzo(e.target.value)} />
            <div className="modal-buttons">
              <button className="ok" onClick={salvaModifica}>Salva</button>
              <button className="annulla" onClick={() => setShowModal(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}



*/



// GestioneMenuPage.jsx - Versione completa corretta
import React, { useState, useEffect, useCallback } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  // ✅ STATE PER VARIANTI (lettura dal prodotto speciale)
  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [prodottoVariantiId, setProdottoVariantiId] = useState(null);
  const [showModalVarianti, setShowModalVarianti] = useState(false);
  const [nuovaVarianteNome, setNuovaVarianteNome] = useState('');
  const [nuovaVarianteCosto, setNuovaVarianteCosto] = useState('0.50');
  const [nuovaVarianteTipo, setNuovaVarianteTipo] = useState('aggiunta');

  // ✅ Messaggio temporaneo - deve essere dichiarato PRIMA di essere usato
  const mostraMessaggio = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  // ✅ Trova il prodotto speciale che contiene le varianti
  const trovaProdottoVarianti = useCallback((menuData) => {
    // Cerca per nome
    const prodottoVarianti = menuData.find(p => 
      p.nome === "CONFIG_VARIANTI_GLOBALI" || 
      p.nome === "VARIANTI_GLOBALI_EXPORT" ||
      (p.varianti && p.varianti.length > 0 && p.categoria === "Configurazione")
    );
    
    if (prodottoVarianti) {
      setProdottoVariantiId(prodottoVarianti.id);
      setVariantiGlobali(prodottoVarianti.varianti || []);
    } else {
      setProdottoVariantiId(null);
      setVariantiGlobali([]);
    }
  }, []);

  // ✅ WRAPPA le funzioni con useCallback per evitare dipendenze cicliche
  const caricaMenu = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        // ✅ Cerca il prodotto speciale con le varianti
        trovaProdottoVarianti(data);
      })
      .catch(() => setMenu([]));
  }, [trovaProdottoVarianti]); // ✅ Aggiunta dipendenza

  // ✅ Carica coperto con useCallback
  const caricaCoperto = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/coperto')
      .then(res => res.json())
      .then(data => {
        setCopertoAttivo(!!data.attivo);
        setPrezzoCoperto(data.prezzo !== undefined ? data.prezzo.toString() : '');
      })
      .catch(() => {
        setCopertoAttivo(false);
        setPrezzoCoperto('');
      });
  }, []);

  // Aggiorna coperto sul server
  const aggiornaCoperto = useCallback((attivo, prezzo) => {
    fetch('https://qrcode-finale.onrender.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  }, []);

  // Toggle coperto
  const toggleCoperto = useCallback(() => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  }, [copertoAttivo, prezzoCoperto, aggiornaCoperto]);

  // Cambia prezzo coperto
  const cambiaPrezzoCoperto = useCallback((value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  }, [copertoAttivo, aggiornaCoperto]);

  // Aggiungi nuovo prodotto
  const aggiungiProdotto = useCallback(() => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nome, 
        prezzo: parseFloat(prezzo), 
        categoria: categoriaFinale
      })
    })
      .then(() => {
        setNome('');
        setPrezzo('');
        setCategoria('');
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      });
  }, [nome, prezzo, categoria, nuovaCategoria, caricaMenu, mostraMessaggio]);

  // ✅ Crea prodotto speciale per le varianti
  const creaProdottoVarianti = useCallback((varianti) => {
    const prodottoVarianti = {
      nome: "CONFIG_VARIANTI_GLOBALI",
      prezzo: 0,
      categoria: "Configurazione",
      varianti: varianti
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodottoVarianti)
    })
      .then(res => res.json())
      .then(data => {
        setProdottoVariantiId(data.id);
        setVariantiGlobali(varianti);
        setNuovaVarianteNome('');
        setNuovaVarianteCosto('0.50');
        setNuovaVarianteTipo('aggiunta');
        setShowModalVarianti(false);
        caricaMenu(); // Ricarica il menu
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiunta della variante');
      });
  }, [caricaMenu, mostraMessaggio]);

  // ✅ Aggiorna prodotto speciale per le varianti
  const aggiornaProdottoVarianti = useCallback((nuoveVarianti) => {
    fetch(`https://qrcode-finale.onrender.com/api/menu/${prodottoVariantiId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        varianti: nuoveVarianti
      })
    })
      .then(() => {
        setVariantiGlobali(nuoveVarianti);
        setNuovaVarianteNome('');
        setNuovaVarianteCosto('0.50');
        setNuovaVarianteTipo('aggiunta');
        setShowModalVarianti(false);
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiornamento delle varianti');
      });
  }, [prodottoVariantiId, mostraMessaggio]);

  // ✅ AGGIUNGI VARIANTE (aggiorna il prodotto speciale)
  const aggiungiVariante = useCallback(() => {
    if (!nuovaVarianteNome.trim()) {
      alert('Inserisci un nome per la variante');
      return;
    }

    const costo = parseFloat(nuovaVarianteCosto) || 0;
    
    const nuovaVariante = {
      id: Date.now(),
      nome: nuovaVarianteNome.trim(),
      tipo: nuovaVarianteTipo,
      costo: costo,
      predefinita: false
    };

    // Se esiste già un prodotto per le varianti, aggiornalo
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti([...variantiGlobali, nuovaVariante]);
    } else {
      // Altrimenti crea un nuovo prodotto speciale
      creaProdottoVarianti([nuovaVariante]);
    }
  }, [
    nuovaVarianteNome, 
    nuovaVarianteCosto, 
    nuovaVarianteTipo, 
    prodottoVariantiId, 
    variantiGlobali, 
    aggiornaProdottoVarianti, 
    creaProdottoVarianti
  ]); // ✅ Aggiunte tutte le dipendenze

  // ✅ ELIMINA VARIANTE
  const eliminaVariante = useCallback((id) => {
    if (!window.confirm('Sei sicuro di eliminare questa variante?')) return;
    
    const nuoveVarianti = variantiGlobali.filter(v => v.id !== id);
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante eliminata!');
    }
  }, [variantiGlobali, prodottoVariantiId, aggiornaProdottoVarianti, mostraMessaggio]);

  // ✅ MODIFICA VARIANTE
  const modificaVariante = useCallback((variante) => {
    const nuovoNome = prompt('Modifica nome variante:', variante.nome);
    if (!nuovoNome || nuovoNome.trim() === '') return;
    
    const nuovoCosto = prompt('Modifica costo (€):', variante.costo);
    const costo = parseFloat(nuovoCosto) || 0;
    
    const nuoveVarianti = variantiGlobali.map(v => 
      v.id === variante.id 
        ? { ...v, nome: nuovoNome.trim(), costo: costo }
        : v
    );
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante modificata!');
    }
  }, [variantiGlobali, prodottoVariantiId, aggiornaProdottoVarianti, mostraMessaggio]);

  // ✅ Eliminazione categoria
  const eliminaCategoria = useCallback((cat) => {
    if (!window.confirm(`Sei sicuro di eliminare la categoria "${cat}" e tutti i suoi prodotti?`)) return;
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(cat)}`, { method: 'DELETE' })
      .then(() => {
        caricaMenu();
        mostraMessaggio(`Categoria "${cat}" eliminata!`);
      });
  }, [caricaMenu, mostraMessaggio]);

  // ✅ Eliminazione prodotto
  const eliminaProdotto = useCallback((id) => {
    if (!window.confirm('Sei sicuro di eliminare questo prodotto?')) return;
    fetch(`https://qrcode-finale.onrender.com/api/menu/${id}`, { method: 'DELETE' })
      .then(() => {
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      });
  }, [caricaMenu, mostraMessaggio]);

  // ✅ Apri modal modifica prodotto
  const apriModifica = useCallback((prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  }, []);

  // ✅ Salva modifica prodotto
  const salvaModifica = useCallback(() => {
    fetch(`https://qrcode-finale.onrender.com/api/menu/${modificaProdotto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nome: modificaNome, 
        prezzo: parseFloat(modificaPrezzo)
      })
    })
      .then(() => {
        caricaMenu();
        setShowModal(false);
        mostraMessaggio('Prodotto modificato!');
      });
  }, [modificaProdotto, modificaNome, modificaPrezzo, caricaMenu, mostraMessaggio]);

  // ✅ useEffect con tutte le dipendenze corrette
  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, [caricaMenu, caricaCoperto]);

  const categorie = [...new Set(menu.map(item => item.categoria))].filter(cat => cat !== "Configurazione");

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* Aggiungi prodotto */}
      <div className="aggiungi-box">
        <h3>Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input type="text" placeholder="Nome pietanza" value={nome} onChange={e => setNome(e.target.value)} />
          <input type="number" placeholder="Prezzo" value={prezzo} onChange={e => setPrezzo(e.target.value)} step="0.01" />
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Seleziona categoria</option>
            {categorie.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input type="text" placeholder="Nuova categoria" value={nuovaCategoria} onChange={e => setNuovaCategoria(e.target.value)} />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* ✅ GESTIONE VARIANTI GLOBALI */}
      <div className="varianti-globali-box">
        <div className="varianti-header">
          <h3>Gestione Varianti Globali</h3>
          <button className="btn-varianti" onClick={() => setShowModalVarianti(true)}>
            + Nuova Variante
          </button>
        </div>
        
        {variantiGlobali.length === 0 ? (
          <div>
            <p className="nessuna-variante">Nessuna variante configurata</p>
            <p className="info-varianti">
              Le varianti qui configurate saranno disponibili per TUTTI i piatti nella pagina ordini.
            </p>
          </div>
        ) : (
          <div className="varianti-lista">
            {variantiGlobali.map(variante => (
              <div key={variante.id} className="variante-globale-item">
                <div className="variante-info">
                  <span className="variante-nome">{variante.nome}</span>
                  <span className={`variante-costo ${variante.tipo}`}>
                    {variante.tipo === 'aggiunta' ? `+ €${variante.costo.toFixed(2)}` : ' Senza '}
                  </span>
                </div>
                <div className="variante-actions">
                  <button className="btn-modifica" onClick={() => modificaVariante(variante)}>
                    Modifica
                  </button>
                  <button className="btn-elimina" onClick={() => eliminaVariante(variante.id)}>
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <p className="info-varianti">
          Le varianti qui configurate saranno disponibili per TUTTI i piatti nella pagina ordini.
          
        </p>
      </div>

      {/* Gestione coperto */}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && <input type="number" placeholder="Prezzo coperto" value={prezzoCoperto} onChange={e => cambiaPrezzoCoperto(e.target.value)} step="0.01" />}
      </div>

      {/* Categorie e prodotti (esclude Configurazione) */}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => (
        <div key={cat} className="categoria-blocco">
          <div className="categoria-header">
            <h4>{cat}</h4>
            <div className="categoria-actions">
              <button className="elimina-cat" onClick={() => eliminaCategoria(cat)}>Elimina Categoria</button>
            </div>
          </div>
          <ul>
            {menu
              .filter(item => item.categoria === cat)
              .map(item => (
                <li key={item.id}>
                  <div className="prodotto-info">
                    <span className="prodotto-nome">{item.nome}</span>
                    <span className="prodotto-prezzo">€ {item.prezzo.toFixed(2)}</span>
                  </div>
                  <div className="prod-actions">
                    <button className="modifica" onClick={() => apriModifica(item)}>Modifica</button>
                    <button className="ordina" onClick={() => eliminaProdotto(item.id)}>Elimina</button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {/* Modal modifica prodotto */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Modifica Prodotto</h3>
            <input type="text" value={modificaNome} onChange={e => setModificaNome(e.target.value)} />
            <input type="number" value={modificaPrezzo} onChange={e => setModificaPrezzo(e.target.value)} step="0.01" />
            <div className="modal-buttons">
              <button className="ok" onClick={salvaModifica}>Salva</button>
              <button className="annulla" onClick={() => setShowModal(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal per aggiungere nuova variante */}
      {showModalVarianti && (
        <div className="modal-backdrop">
          <div className="modal-varianti-globali">
            <div className="modal-header">
              <h3>Aggiungi Nuova Variante Globale</h3>
              <button className="close-btn" onClick={() => setShowModalVarianti(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-variante">
                <div className="form-group">
                  <label>Nome Variante:</label>
                  <input 
                    type="text" 
                    placeholder="Es: 'Senza mozzarella', 'Aggiungi funghi'" 
                    value={nuovaVarianteNome}
                    onChange={e => setNuovaVarianteNome(e.target.value)}
                    className="input-variante"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo:</label>
                  <select 
                    value={nuovaVarianteTipo} 
                    onChange={e => setNuovaVarianteTipo(e.target.value)}
                    className="select-tipo"
                  >
                    <option value="aggiunta">Aggiunta (+)</option>
                    <option value="rimozione">Rimozione</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Costo Aggiuntivo:</label>
                  <div className="costo-input-container">
                    <span className="costo-prefix">
                      {nuovaVarianteTipo === 'aggiunta' ? '+ €' : ''}
                    </span>
                    <input 
                      type="number" 
                      value={nuovaVarianteCosto}
                      onChange={e => setNuovaVarianteCosto(e.target.value)}
                      step="0.01"
                      min="0"
                      className="input-costo"
                      disabled={nuovaVarianteTipo === 'rimozione'}
                      placeholder={nuovaVarianteTipo === 'rimozione' ? '0.00' : '0.50'}
                    />
                  </div>
                  {nuovaVarianteTipo === 'rimozione' && (
                    <p className="info-rimozione">Le rimozioni non hanno costo aggiuntivo</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Info:</label>
                  <p className="info-text">
                    Questa variante sarà disponibile per TUTTI i piatti nella pagina ordini.
                    {nuovaVarianteTipo === 'aggiunta' && ' I clienti potranno selezionarla pagando il costo aggiuntivo.'}
                    {nuovaVarianteTipo === 'rimozione' && ' I clienti potranno rimuovere questo ingrediente senza costi aggiuntivi.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-salva" onClick={aggiungiVariante}>
                Aggiungi Variante
              </button>
              <button className="btn-annulla" onClick={() => setShowModalVarianti(false)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}