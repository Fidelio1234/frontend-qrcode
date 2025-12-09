
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































// FUNZIONANTE MA CON IL PROBLEMA CATEGORIA
/*import React, { useState, useEffect, useCallback } from 'react';
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

      {/* Aggiungi prodotto *//*}
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

      {/* ✅ GESTIONE VARIANTI GLOBALI *//*}
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

      {/* Gestione coperto *//*}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && <input type="number" placeholder="Prezzo coperto" value={prezzoCoperto} onChange={e => cambiaPrezzoCoperto(e.target.value)} step="0.01" />}
      </div>

      {/* Categorie e prodotti (esclude Configurazione) *//*}
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

      {/* Modal modifica prodotto *//*}
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

      {/* ✅ Modal per aggiungere nuova variante *//*}
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



*/

















// FUNZIONANTE MA SENZA MODAL VARIANTI
/*import React, { useState, useEffect, useCallback } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState(() => {
    return localStorage.getItem('ultima_categoria_menu') || '';
  });
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [prodottoVariantiId, setProdottoVariantiId] = useState(null);
  const [showModalVarianti, setShowModalVarianti] = useState(false);
  const [nuovaVarianteNome, setNuovaVarianteNome] = useState('');
  const [nuovaVarianteCosto, setNuovaVarianteCosto] = useState('0.50');
  const [nuovaVarianteTipo, setNuovaVarianteTipo] = useState('aggiunta');

  const mostraMessaggio = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  const salvaCategoria = useCallback((cat) => {
    if (cat && cat !== 'nuova') {
      localStorage.setItem('ultima_categoria_menu', cat);
    }
  }, []);

  const trovaProdottoVarianti = useCallback((menuData) => {
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

  const caricaMenu = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        trovaProdottoVarianti(data);
      })
      .catch(() => setMenu([]));
  }, [trovaProdottoVarianti]);

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

  const aggiornaCoperto = useCallback((attivo, prezzo) => {
    fetch('https://qrcode-finale.onrender.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  }, []);

  const toggleCoperto = useCallback(() => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  }, [copertoAttivo, prezzoCoperto, aggiornaCoperto]);

  const cambiaPrezzoCoperto = useCallback((value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  }, [copertoAttivo, aggiornaCoperto]);

  const creaCategoriaVuota = useCallback(() => {
    if (!nuovaCategoria.trim()) {
      alert('Inserisci un nome per la categoria');
      return;
    }

    const prodottoPlaceholder = {
      nome: `__CATEGORIA_PLACEHOLDER__`,
      prezzo: 0.01,
      categoria: nuovaCategoria.trim(),
      placeholder: true
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodottoPlaceholder)
    })
      .then(() => {
        salvaCategoria(nuovaCategoria.trim());
        setCategoria(nuovaCategoria.trim());
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio(`Categoria "${nuovaCategoria}" creata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nella creazione della categoria');
      });
  }, [nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

  const aggiungiProdotto = useCallback(() => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    if (categoria === 'nuova' && nuovaCategoria.trim()) {
      const creaCategoriaEPoiProdotto = () => {
        const categoriaPlaceholder = {
          nome: `__CATEGORIA_PLACEHOLDER__`,
          prezzo: 0.01,
          categoria: nuovaCategoria.trim(),
          placeholder: true
        };

        return fetch('https://qrcode-finale.onrender.com/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaPlaceholder)
        })
          .then(() => {
            salvaCategoria(nuovaCategoria.trim());
            return nuovaCategoria.trim();
          });
      };

      creaCategoriaEPoiProdotto()
        .then(catCreata => {
          const prodottoReale = {
            nome,
            prezzo: parseFloat(prezzo),
            categoria: catCreata
          };

          return fetch('https://qrcode-finale.onrender.com/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prodottoReale)
          });
        })
        .then(() => {
          setNome('');
          setPrezzo('');
          setCategoria(nuovaCategoria.trim());
          setNuovaCategoria('');
          caricaMenu();
          mostraMessaggio('Categoria e prodotto creati!');
        })
        .catch(err => {
          console.error('Errore:', err);
          alert('Errore nella creazione');
        });
      
      return;
    }

    const prodotto = {
      nome,
      prezzo: parseFloat(prezzo),
      categoria: categoriaFinale
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodotto)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Errore nella risposta del server');
        }
        return res.json();
      })
      .then(() => {
        salvaCategoria(categoriaFinale);
        setNome('');
        setPrezzo('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      })
      .catch(err => {
        console.error('Errore completo:', err);
        alert('Errore nell\'aggiunta del prodotto: ' + err.message);
      });
  }, [nome, prezzo, categoria, nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

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
        caricaMenu();
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiunta della variante');
      });
  }, [caricaMenu, mostraMessaggio]);

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

    if (prodottoVariantiId) {
      aggiornaProdottoVarianti([...variantiGlobali, nuovaVariante]);
    } else {
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
  ]);

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

  const eliminaCategoria = useCallback((cat) => {
    if (!window.confirm(`Sei sicuro di eliminare la categoria "${cat}" e tutti i suoi prodotti?`)) return;
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(cat)}`, { method: 'DELETE' })
      .then(() => {
        if (localStorage.getItem('ultima_categoria_menu') === cat) {
          localStorage.removeItem('ultima_categoria_menu');
          setCategoria('');
        }
        caricaMenu();
        mostraMessaggio(`Categoria "${cat}" eliminata!`);
      });
  }, [caricaMenu, mostraMessaggio]);

  const eliminaProdotto = useCallback((id) => {
    if (!window.confirm('Sei sicuro di eliminare questo prodotto?')) return;
    fetch(`https://qrcode-finale.onrender.com/api/menu/${id}`, { method: 'DELETE' })
      .then(() => {
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      });
  }, [caricaMenu, mostraMessaggio]);

  const apriModifica = useCallback((prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  }, []);

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

  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, [caricaMenu, caricaCoperto]);

  const categorie = [...new Set(menu
    .filter(item => item.categoria !== "Configurazione")
    .map(item => item.categoria)
  )];

  const getProdottiPerCategoria = (cat) => {
    return menu.filter(item => 
      item.categoria === cat && 
      item.nome !== '__CATEGORIA_PLACEHOLDER__'
    );
  };

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* SEZIONE 1: CREA NUOVA CATEGORIA VUOTA *//*}
      <div className="aggiungi-box">
        <h3>🔸 Crea Nuova Categoria</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome categoria" 
            value={nuovaCategoria}
            onChange={e => setNuovaCategoria(e.target.value)}
          />
          <button 
            onClick={creaCategoriaVuota}
            disabled={!nuovaCategoria.trim()}
          >
            + Crea Categoria
          </button>
        </div>
      </div>

      {/* SEZIONE 2: AGGIUNGI PRODOTTO *//*}
      <div className="aggiungi-box">
        <h3>🔸 Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome pietanza" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Prezzo" 
            value={prezzo} 
            onChange={e => setPrezzo(e.target.value)} 
            step="0.01" 
          />
          <select 
            value={categoria} 
            onChange={(e) => {
              setCategoria(e.target.value);
              if (e.target.value && e.target.value !== 'nuova') {
                salvaCategoria(e.target.value);
              }
            }}
          >
            <option value="">Seleziona categoria</option>
            {categorie.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input 
              type="text" 
              placeholder="Nuova categoria" 
              value={nuovaCategoria} 
              onChange={e => setNuovaCategoria(e.target.value)} 
            />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* GESTIONE VARIANTI GLOBALI *//*}
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
                    {variante.tipo === 'aggiunta' ? `+ €${variante.costo.toFixed(2)}` : 'Senza '}
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

      {/* Gestione coperto *//*}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && (
          <input 
            type="number" 
            placeholder="Prezzo coperto" 
            value={prezzoCoperto} 
            onChange={e => cambiaPrezzoCoperto(e.target.value)} 
            step="0.01" 
          />
        )}
      </div>

      {/* Categorie e prodotti *//*}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => {
        const prodotti = getProdottiPerCategoria(cat);
        
        return (
          <div key={cat} className="categoria-blocco">
            <div className="categoria-header">
              <h4>{cat}</h4>
              <div className="categoria-actions">
                <button className="elimina-cat" onClick={() => eliminaCategoria(cat)}>Elimina Categoria</button>
              </div>
            </div>
            {prodotti.length === 0 ? (
              <div className="categoria-vuota">
                <p>Questa categoria è vuota.</p>
              </div>
            ) : (
              <ul>
                {prodotti.map(item => (
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
            )}
          </div>
        );
      })}

      {/* Modal modifica prodotto *//*}
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

      {/* Modal per aggiungere nuova variante *//*}
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





*/

























//. VERSIONE CON __CATEGORIA_PLACEHOLDER__ 
/*import React, { useState, useEffect, useCallback } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState(() => {
    return localStorage.getItem('ultima_categoria_menu') || '';
  });
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [prodottoVariantiId, setProdottoVariantiId] = useState(null);
  
  // Modal per nuova variante
  const [showModalVarianti, setShowModalVarianti] = useState(false);
  const [nuovaVarianteNome, setNuovaVarianteNome] = useState('');
  const [nuovaVarianteCosto, setNuovaVarianteCosto] = useState('0.50');
  const [nuovaVarianteTipo, setNuovaVarianteTipo] = useState('aggiunta');
  
  // Modal per modifica variante
  const [showModalModificaVariante, setShowModalModificaVariante] = useState(false);
  const [varianteDaModificare, setVarianteDaModificare] = useState(null);
  const [modificaVarianteNome, setModificaVarianteNome] = useState('');
  const [modificaVarianteCosto, setModificaVarianteCosto] = useState('');
  const [modificaVarianteTipo, setModificaVarianteTipo] = useState('aggiunta');
  
  // Modal per conferma eliminazione variante
  const [showModalConfermaElimina, setShowModalConfermaElimina] = useState(false);
  const [varianteDaEliminare, setVarianteDaEliminare] = useState(null);

  // Modali per eliminazione categoria e prodotto
  const [showModalEliminaCategoria, setShowModalEliminaCategoria] = useState(false);
  const [categoriaDaEliminare, setCategoriaDaEliminare] = useState(null);
  const [showModalEliminaProdotto, setShowModalEliminaProdotto] = useState(false);
  const [prodottoDaEliminare, setProdottoDaEliminare] = useState(null);

  const mostraMessaggio = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  const salvaCategoria = useCallback((cat) => {
    if (cat && cat !== 'nuova') {
      localStorage.setItem('ultima_categoria_menu', cat);
    }
  }, []);

  const trovaProdottoVarianti = useCallback((menuData) => {
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

  const caricaMenu = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        trovaProdottoVarianti(data);
      })
      .catch(() => setMenu([]));
  }, [trovaProdottoVarianti]);

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

  const aggiornaCoperto = useCallback((attivo, prezzo) => {
    fetch('https://qrcode-finale.onrender.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  }, []);

  const toggleCoperto = useCallback(() => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  }, [copertoAttivo, prezzoCoperto, aggiornaCoperto]);

  const cambiaPrezzoCoperto = useCallback((value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  }, [copertoAttivo, aggiornaCoperto]);

  const creaCategoriaVuota = useCallback(() => {
    if (!nuovaCategoria.trim()) {
      alert('Inserisci un nome per la categoria');
      return;
    }

    const prodottoPlaceholder = {
      nome: `__CATEGORIA_PLACEHOLDER__`,
      prezzo: 0.01,
      categoria: nuovaCategoria.trim(),
      placeholder: true
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodottoPlaceholder)
    })
      .then(() => {
        salvaCategoria(nuovaCategoria.trim());
        setCategoria(nuovaCategoria.trim());
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio(`Categoria "${nuovaCategoria}" creata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nella creazione della categoria');
      });
  }, [nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

  const aggiungiProdotto = useCallback(() => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    if (categoria === 'nuova' && nuovaCategoria.trim()) {
      const creaCategoriaEPoiProdotto = () => {
        const categoriaPlaceholder = {
          nome: `__CATEGORIA_PLACEHOLDER__`,
          prezzo: 0.01,
          categoria: nuovaCategoria.trim(),
          placeholder: true
        };

        return fetch('https://qrcode-finale.onrender.com/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaPlaceholder)
        })
          .then(() => {
            salvaCategoria(nuovaCategoria.trim());
            return nuovaCategoria.trim();
          });
      };

      creaCategoriaEPoiProdotto()
        .then(catCreata => {
          const prodottoReale = {
            nome,
            prezzo: parseFloat(prezzo),
            categoria: catCreata
          };

          return fetch('https://qrcode-finale.onrender.com/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prodottoReale)
          });
        })
        .then(() => {
          setNome('');
          setPrezzo('');
          setCategoria(nuovaCategoria.trim());
          setNuovaCategoria('');
          caricaMenu();
          mostraMessaggio('Categoria e prodotto creati!');
        })
        .catch(err => {
          console.error('Errore:', err);
          alert('Errore nella creazione');
        });
      
      return;
    }

    const prodotto = {
      nome,
      prezzo: parseFloat(prezzo),
      categoria: categoriaFinale
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodotto)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Errore nella risposta del server');
        }
        return res.json();
      })
      .then(() => {
        salvaCategoria(categoriaFinale);
        setNome('');
        setPrezzo('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      })
      .catch(err => {
        console.error('Errore completo:', err);
        alert('Errore nell\'aggiunta del prodotto: ' + err.message);
      });
  }, [nome, prezzo, categoria, nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

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
        caricaMenu();
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiunta della variante');
      });
  }, [caricaMenu, mostraMessaggio]);

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
        mostraMessaggio('Variante aggiornata!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiornamento delle varianti');
      });
  }, [prodottoVariantiId, mostraMessaggio]);

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

    if (prodottoVariantiId) {
      aggiornaProdottoVarianti([...variantiGlobali, nuovaVariante]);
    } else {
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
  ]);

  const apriModificaVariante = useCallback((variante) => {
    setVarianteDaModificare(variante);
    setModificaVarianteNome(variante.nome);
    setModificaVarianteCosto(variante.costo.toString());
    setModificaVarianteTipo(variante.tipo);
    setShowModalModificaVariante(true);
  }, []);

  const salvaModificaVariante = useCallback(() => {
    if (!modificaVarianteNome.trim()) {
      alert('Inserisci un nome per la variante');
      return;
    }

    const costo = parseFloat(modificaVarianteCosto) || 0;
    
    const nuoveVarianti = variantiGlobali.map(v => 
      v.id === varianteDaModificare.id 
        ? { 
            ...v, 
            nome: modificaVarianteNome.trim(), 
            costo: costo,
            tipo: modificaVarianteTipo
          }
        : v
    );
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante modificata!');
    }
    
    setShowModalModificaVariante(false);
    setVarianteDaModificare(null);
  }, [
    varianteDaModificare, 
    modificaVarianteNome, 
    modificaVarianteCosto, 
    modificaVarianteTipo, 
    variantiGlobali, 
    prodottoVariantiId, 
    aggiornaProdottoVarianti, 
    mostraMessaggio
  ]);

  const apriConfermaEliminaVariante = useCallback((variante) => {
    setVarianteDaEliminare(variante);
    setShowModalConfermaElimina(true);
  }, []);

  const confermaEliminaVariante = useCallback(() => {
    const nuoveVarianti = variantiGlobali.filter(v => v.id !== varianteDaEliminare.id);
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante eliminata!');
    }
    
    setShowModalConfermaElimina(false);
    setVarianteDaEliminare(null);
  }, [variantiGlobali, varianteDaEliminare, prodottoVariantiId, aggiornaProdottoVarianti, mostraMessaggio]);

  // Funzioni per eliminazione con modali
  const apriModalEliminaCategoria = useCallback((cat) => {
    setCategoriaDaEliminare(cat);
    setShowModalEliminaCategoria(true);
  }, []);

  const confermaEliminaCategoria = useCallback(() => {
    if (!categoriaDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(categoriaDaEliminare)}`, { method: 'DELETE' })
      .then(() => {
        if (localStorage.getItem('ultima_categoria_menu') === categoriaDaEliminare) {
          localStorage.removeItem('ultima_categoria_menu');
          setCategoria('');
        }
        setShowModalEliminaCategoria(false);
        setCategoriaDaEliminare(null);
        caricaMenu();
        mostraMessaggio(`Categoria "${categoriaDaEliminare}" eliminata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione della categoria');
      });
  }, [categoriaDaEliminare, caricaMenu, mostraMessaggio]);

  const apriModalEliminaProdotto = useCallback((prodotto) => {
    setProdottoDaEliminare(prodotto);
    setShowModalEliminaProdotto(true);
  }, []);

  const confermaEliminaProdotto = useCallback(() => {
    if (!prodottoDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/menu/${prodottoDaEliminare.id}`, { method: 'DELETE' })
      .then(() => {
        setShowModalEliminaProdotto(false);
        setProdottoDaEliminare(null);
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione del prodotto');
      });
  }, [prodottoDaEliminare, caricaMenu, mostraMessaggio]);

  const apriModifica = useCallback((prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  }, []);

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

  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, [caricaMenu, caricaCoperto]);

  const categorie = [...new Set(menu
    .filter(item => item.categoria !== "Configurazione")
    .map(item => item.categoria)
  )];

  const getProdottiPerCategoria = (cat) => {
    return menu.filter(item => 
      item.categoria === cat && 
      item.nome !== '__CATEGORIA_PLACEHOLDER__'
    );
  };

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* SEZIONE 1: CREA NUOVA CATEGORIA VUOTA *//*}
      <div className="aggiungi-box">
        <h3>🔸 Crea Nuova Categoria</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome categoria" 
            value={nuovaCategoria}
            onChange={e => setNuovaCategoria(e.target.value)}
          />
          <button 
            onClick={creaCategoriaVuota}
            disabled={!nuovaCategoria.trim()}
          >
            + Crea Categoria
          </button>
        </div>
      </div>

      {/* SEZIONE 2: AGGIUNGI PRODOTTO *//*}
      <div className="aggiungi-box">
        <h3>🔸 Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome pietanza" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Prezzo" 
            value={prezzo} 
            onChange={e => setPrezzo(e.target.value)} 
            step="0.01" 
          />
          <select 
            value={categoria} 
            onChange={(e) => {
              setCategoria(e.target.value);
              if (e.target.value && e.target.value !== 'nuova') {
                salvaCategoria(e.target.value);
              }
            }}
          >
            <option value="">Seleziona categoria</option>
            {categorie.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input 
              type="text" 
              placeholder="Nuova categoria" 
              value={nuovaCategoria} 
              onChange={e => setNuovaCategoria(e.target.value)} 
            />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* GESTIONE VARIANTI GLOBALI *//*}
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
                    {variante.tipo === 'aggiunta' ? `+ €${variante.costo.toFixed(2)}` : 'Senza '}
                  </span>
                </div>
                <div className="variante-actions">
                  <button 
                    className="btn-modifica" 
                    onClick={() => apriModificaVariante(variante)}
                  >
                    Modifica
                  </button>
                  <button 
                    className="btn-elimina" 
                    onClick={() => apriConfermaEliminaVariante(variante)}
                  >
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

      {/* Gestione coperto *//*}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && (
          <input 
            type="number" 
            placeholder="Prezzo coperto" 
            value={prezzoCoperto} 
            onChange={e => cambiaPrezzoCoperto(e.target.value)} 
            step="0.01" 
          />
        )}
      </div>

      {/* Categorie e prodotti *//*}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => {
        const prodotti = getProdottiPerCategoria(cat);
        
        return (
          <div key={cat} className="categoria-blocco">
            <div className="categoria-header">
              <h4>{cat}</h4>
              <div className="categoria-actions">
                <button className="elimina-cat" onClick={() => apriModalEliminaCategoria(cat)}>Elimina Categoria</button>
              </div>
            </div>
            {prodotti.length === 0 ? (
              <div className="categoria-vuota">
                <p>Questa categoria è vuota.</p>
              </div>
            ) : (
              <ul>
                {prodotti.map(item => (
                  <li key={item.id}>
                    <div className="prodotto-info">
                      <span className="prodotto-nome">{item.nome}</span>
                      <span className="prodotto-prezzo">€ {item.prezzo.toFixed(2)}</span>
                    </div>
                    <div className="prod-actions">
                      <button className="modifica" onClick={() => apriModifica(item)}>Modifica</button>
                      <button className="ordina" onClick={() => apriModalEliminaProdotto(item)}>Elimina</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* MODAL MODIFICA PRODOTTO *//*}
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

      {/* MODAL NUOVA VARIANTE *//*}
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

      {/* MODAL MODIFICA VARIANTE *//*}
      {showModalModificaVariante && varianteDaModificare && (
        <div className="modal-backdrop">
          <div className="modal-varianti-globali">
            <div className="modal-header">
              <h3>Modifica Variante</h3>
              <button className="close-btn" onClick={() => setShowModalModificaVariante(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-variante">
                <div className="form-group">
                  <label>Nome Variante:</label>
                  <input 
                    type="text" 
                    value={modificaVarianteNome}
                    onChange={e => setModificaVarianteNome(e.target.value)}
                    className="input-variante"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo:</label>
                  <select 
                    value={modificaVarianteTipo} 
                    onChange={e => setModificaVarianteTipo(e.target.value)}
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
                      {modificaVarianteTipo === 'aggiunta' ? '+ €' : ''}
                    </span>
                    <input 
                      type="number" 
                      value={modificaVarianteCosto}
                      onChange={e => setModificaVarianteCosto(e.target.value)}
                      step="0.01"
                      min="0"
                      className="input-costo"
                      disabled={modificaVarianteTipo === 'rimozione'}
                    />
                  </div>
                  {modificaVarianteTipo === 'rimozione' && (
                    <p className="info-rimozione">Le rimozioni non hanno costo aggiuntivo</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-salva" onClick={salvaModificaVariante}>
                Salva Modifiche
              </button>
              <button className="btn-annulla" onClick={() => setShowModalModificaVariante(false)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFERMA ELIMINA VARIANTE *//*}
      {showModalConfermaElimina && varianteDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione</h3>
              <button className="close-btn" onClick={() => setShowModalConfermaElimina(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la variante:</p>
                <p className="variante-da-eliminare">
                  <strong>{varianteDaEliminare.nome}</strong>
                  <span className={`variante-tipo ${varianteDaEliminare.tipo}`}>
                    {varianteDaEliminare.tipo === 'aggiunta' ? ` (+ €${varianteDaEliminare.costo.toFixed(2)})` : ' (Rimozione)'}
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-conferma-elimina" onClick={confermaEliminaVariante}>
                Elimina
              </button>
              <button className="btn-annulla" onClick={() => setShowModalConfermaElimina(false)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA CATEGORIA *//*}
      {showModalEliminaCategoria && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Categoria</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaCategoria(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la categoria:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.4rem', color: '#dc3545' }}>{categoriaDaEliminare}</strong>
                </p>
                <div className="avvertenza">
                  <p>⚠️ <strong>ATTENZIONE:</strong> Questa azione eliminerà:</p>
                  <ul>
                    <li>Tutti i prodotti nella categoria "{categoriaDaEliminare}"</li>
                    <li>La categoria stessa dal menù</li>
                  </ul>
                </div>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-conferma-elimina" onClick={confermaEliminaCategoria}>
                Elimina Categoria
              </button>
              <button className="btn-annulla" onClick={() => setShowModalEliminaCategoria(false)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA PRODOTTO *//*}
      {showModalEliminaProdotto && prodottoDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Prodotto</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaProdotto(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare il prodotto:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.3rem' }}>{prodottoDaEliminare.nome}</strong>
                  <span style={{ color: '#495057', marginTop: '5px' }}>
                    Categoria: <strong>{prodottoDaEliminare.categoria}</strong>
                  </span>
                  <span style={{ color: '#28a745', marginTop: '5px' }}>
                    Prezzo: <strong>€ {prodottoDaEliminare.prezzo.toFixed(2)}</strong>
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-conferma-elimina" onClick={confermaEliminaProdotto}>
                Elimina Prodotto
              </button>
              <button className="btn-annulla" onClick={() => setShowModalEliminaProdotto(false)}>
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



*/



























//. FUNZIONA MA SENZA L'ABILITAZIONE PER CATEGORIA DELLE VARIANTI


/*import React, { useState, useEffect, useCallback } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState(() => {
    return localStorage.getItem('ultima_categoria_menu') || '';
  });
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [prodottoVariantiId, setProdottoVariantiId] = useState(null);
  
  // Modal per nuova variante
  const [showModalVarianti, setShowModalVarianti] = useState(false);
  const [nuovaVarianteNome, setNuovaVarianteNome] = useState('');
  const [nuovaVarianteCosto, setNuovaVarianteCosto] = useState('0.50');
  const [nuovaVarianteTipo, setNuovaVarianteTipo] = useState('aggiunta');
  
  // Modal per modifica variante
  const [showModalModificaVariante, setShowModalModificaVariante] = useState(false);
  const [varianteDaModificare, setVarianteDaModificare] = useState(null);
  const [modificaVarianteNome, setModificaVarianteNome] = useState('');
  const [modificaVarianteCosto, setModificaVarianteCosto] = useState('');
  const [modificaVarianteTipo, setModificaVarianteTipo] = useState('aggiunta');
  
  // Modal per conferma eliminazione variante
  const [showModalConfermaElimina, setShowModalConfermaElimina] = useState(false);
  const [varianteDaEliminare, setVarianteDaEliminare] = useState(null);

  // Modali per eliminazione categoria e prodotto
  const [showModalEliminaCategoria, setShowModalEliminaCategoria] = useState(false);
  const [categoriaDaEliminare, setCategoriaDaEliminare] = useState(null);
  const [showModalEliminaProdotto, setShowModalEliminaProdotto] = useState(false);
  const [prodottoDaEliminare, setProdottoDaEliminare] = useState(null);

  const mostraMessaggio = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  const salvaCategoria = useCallback((cat) => {
    if (cat && cat !== 'nuova') {
      localStorage.setItem('ultima_categoria_menu', cat);
    }
  }, []);

  const trovaProdottoVarianti = useCallback((menuData) => {
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

  const caricaMenu = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        trovaProdottoVarianti(data);
      })
      .catch(() => setMenu([]));
  }, [trovaProdottoVarianti]);

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

  const aggiornaCoperto = useCallback((attivo, prezzo) => {
    fetch('https://qrcode-finale.onnder.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  }, []);

  const toggleCoperto = useCallback(() => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  }, [copertoAttivo, prezzoCoperto, aggiornaCoperto]);

  const cambiaPrezzoCoperto = useCallback((value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  }, [copertoAttivo, aggiornaCoperto]);

  const creaCategoriaVuota = useCallback(() => {
    if (!nuovaCategoria.trim()) {
      alert('Inserisci un nome per la categoria');
      return;
    }

    const prodottoPlaceholder = {
      nome: `__CATEGORIA_PLACEHOLDER__`,
      prezzo: 0.01,
      categoria: nuovaCategoria.trim(),
      placeholder: true
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodottoPlaceholder)
    })
      .then(() => {
        salvaCategoria(nuovaCategoria.trim());
        setCategoria(nuovaCategoria.trim());
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio(`Categoria "${nuovaCategoria}" creata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nella creazione della categoria');
      });
  }, [nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

  const aggiungiProdotto = useCallback(() => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    if (categoria === 'nuova' && nuovaCategoria.trim()) {
      const creaCategoriaEPoiProdotto = () => {
        const categoriaPlaceholder = {
          nome: `__CATEGORIA_PLACEHOLDER__`,
          prezzo: 0.01,
          categoria: nuovaCategoria.trim(),
          placeholder: true
        };

        return fetch('https://qrcode-finale.onrender.com/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaPlaceholder)
        })
          .then(() => {
            salvaCategoria(nuovaCategoria.trim());
            return nuovaCategoria.trim();
          });
      };

      creaCategoriaEPoiProdotto()
        .then(catCreata => {
          const prodottoReale = {
            nome,
            prezzo: parseFloat(prezzo),
            categoria: catCreata
          };

          return fetch('https://qrcode-finale.onrender.com/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prodottoReale)
          });
        })
        .then(() => {
          setNome('');
          setPrezzo('');
          setCategoria(nuovaCategoria.trim());
          setNuovaCategoria('');
          caricaMenu();
          mostraMessaggio('Categoria e prodotto creati!');
        })
        .catch(err => {
          console.error('Errore:', err);
          alert('Errore nella creazione');
        });
      
      return;
    }

    const prodotto = {
      nome,
      prezzo: parseFloat(prezzo),
      categoria: categoriaFinale
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodotto)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Errore nella risposta del server');
        }
        return res.json();
      })
      .then(() => {
        salvaCategoria(categoriaFinale);
        setNome('');
        setPrezzo('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      })
      .catch(err => {
        console.error('Errore completo:', err);
        alert('Errore nell\'aggiunta del prodotto: ' + err.message);
      });
  }, [nome, prezzo, categoria, nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

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
        caricaMenu();
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiunta della variante');
      });
  }, [caricaMenu, mostraMessaggio]);

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
        mostraMessaggio('Variante aggiornata!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiornamento delle varianti');
      });
  }, [prodottoVariantiId, mostraMessaggio]);

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

    if (prodottoVariantiId) {
      aggiornaProdottoVarianti([...variantiGlobali, nuovaVariante]);
    } else {
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
  ]);

  const apriModificaVariante = useCallback((variante) => {
    setVarianteDaModificare(variante);
    setModificaVarianteNome(variante.nome);
    setModificaVarianteCosto(variante.costo.toString());
    setModificaVarianteTipo(variante.tipo);
    setShowModalModificaVariante(true);
  }, []);

  const salvaModificaVariante = useCallback(() => {
    if (!modificaVarianteNome.trim()) {
      alert('Inserisci un nome per la variante');
      return;
    }

    const costo = parseFloat(modificaVarianteCosto) || 0;
    
    const nuoveVarianti = variantiGlobali.map(v => 
      v.id === varianteDaModificare.id 
        ? { 
            ...v, 
            nome: modificaVarianteNome.trim(), 
            costo: costo,
            tipo: modificaVarianteTipo
          }
        : v
    );
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante modificata!');
    }
    
    setShowModalModificaVariante(false);
    setVarianteDaModificare(null);
  }, [
    varianteDaModificare, 
    modificaVarianteNome, 
    modificaVarianteCosto, 
    modificaVarianteTipo, 
    variantiGlobali, 
    prodottoVariantiId, 
    aggiornaProdottoVarianti, 
    mostraMessaggio
  ]);

  const apriConfermaEliminaVariante = useCallback((variante) => {
    setVarianteDaEliminare(variante);
    setShowModalConfermaElimina(true);
  }, []);

  const confermaEliminaVariante = useCallback(() => {
    const nuoveVarianti = variantiGlobali.filter(v => v.id !== varianteDaEliminare.id);
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante eliminata!');
    }
    
    setShowModalConfermaElimina(false);
    setVarianteDaEliminare(null);
  }, [variantiGlobali, varianteDaEliminare, prodottoVariantiId, aggiornaProdottoVarianti, mostraMessaggio]);

  // Funzioni per eliminazione con modali
  const apriModalEliminaCategoria = useCallback((cat) => {
    setCategoriaDaEliminare(cat);
    setShowModalEliminaCategoria(true);
  }, []);

  const confermaEliminaCategoria = useCallback(() => {
    if (!categoriaDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(categoriaDaEliminare)}`, { method: 'DELETE' })
      .then(() => {
        if (localStorage.getItem('ultima_categoria_menu') === categoriaDaEliminare) {
          localStorage.removeItem('ultima_categoria_menu');
          setCategoria('');
        }
        setShowModalEliminaCategoria(false);
        setCategoriaDaEliminare(null);
        caricaMenu();
        mostraMessaggio(`Categoria "${categoriaDaEliminare}" eliminata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione della categoria');
      });
  }, [categoriaDaEliminare, caricaMenu, mostraMessaggio]);

  const apriModalEliminaProdotto = useCallback((prodotto) => {
    setProdottoDaEliminare(prodotto);
    setShowModalEliminaProdotto(true);
  }, []);

  const confermaEliminaProdotto = useCallback(() => {
    if (!prodottoDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/menu/${prodottoDaEliminare.id}`, { method: 'DELETE' })
      .then(() => {
        setShowModalEliminaProdotto(false);
        setProdottoDaEliminare(null);
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione del prodotto');
      });
  }, [prodottoDaEliminare, caricaMenu, mostraMessaggio]);

  const apriModifica = useCallback((prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  }, []);

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

  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, [caricaMenu, caricaCoperto]);

  // 🔹 MODIFICA: Funzione per identificare se un prodotto è un placeholder
  const isPlaceholder = (item) => {
    return (
      item.nome.includes('__CATEGORIA__') ||
      item.nome.includes('CATEGORIA_PLACEHOLDER') ||
      item.placeholder === true ||
      item.isCategoriaPlaceholder === true
    );
  };

  // 🔹 MODIFICA: Ottieni categorie reali (escludi "Configurazione")
  const categorie = [...new Set(menu
    .filter(item => 
      item.categoria && 
      item.categoria.trim() !== "" &&
      item.categoria !== "Configurazione"
    )
    .map(item => item.categoria)
  )];

  // 🔹 MODIFICA: Ottieni SOLO prodotti REALI per categoria (escludi TUTTI i placeholder)
  const getProdottiPerCategoria = (cat) => {
    return menu.filter(item => 
      item.categoria === cat && 
      !isPlaceholder(item) &&  // Escludi TUTTI i placeholder
      item.categoria !== "Configurazione"  // Escludi prodotti di configurazione
    );
  };

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* SEZIONE 1: CREA NUOVA CATEGORIA VUOTA *//*}
      <div className="aggiungi-box">
        <h3>🔸 Crea Nuova Categoria</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome categoria" 
            value={nuovaCategoria}
            onChange={e => setNuovaCategoria(e.target.value)}
          />
          <button 
            onClick={creaCategoriaVuota}
            disabled={!nuovaCategoria.trim()}
          >
            + Crea Categoria
          </button>
        </div>
      </div>

      {/* SEZIONE 2: AGGIUNGI PRODOTTO *//*}
      <div className="aggiungi-box">
        <h3>🔸 Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome pietanza" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Prezzo" 
            value={prezzo} 
            onChange={e => setPrezzo(e.target.value)} 
            step="0.01" 
          />
          <select 
            value={categoria} 
            onChange={(e) => {
              setCategoria(e.target.value);
              if (e.target.value && e.target.value !== 'nuova') {
                salvaCategoria(e.target.value);
              }
            }}
          >
            <option value="">Seleziona categoria</option>
            {categorie.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input 
              type="text" 
              placeholder="Nuova categoria" 
              value={nuovaCategoria} 
              onChange={e => setNuovaCategoria(e.target.value)} 
            />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* GESTIONE VARIANTI GLOBALI *//*}
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
                    {variante.tipo === 'aggiunta' ? `+ €${variante.costo.toFixed(2)}` : 'Senza '}
                  </span>
                </div>
                <div className="variante-actions">
                  <button 
                    className="btn-modifica" 
                    onClick={() => apriModificaVariante(variante)}
                  >
                    Modifica
                  </button>
                  <button 
                    className="btn-elimina" 
                    onClick={() => apriConfermaEliminaVariante(variante)}
                  >
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

      {/* Gestione coperto *//*}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && (
          <input 
            type="number" 
            placeholder="Prezzo coperto" 
            value={prezzoCoperto} 
            onChange={e => cambiaPrezzoCoperto(e.target.value)} 
            step="0.01" 
          />
        )}
      </div>

      {/* Categorie e prodotti - MOSTRA SOLO PRODOTTI REALI *//*}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => {
        const prodotti = getProdottiPerCategoria(cat);
        
        // Controlla se la categoria esiste solo come placeholder
        const esistePlaceholder = menu.some(item => 
          item.categoria === cat && isPlaceholder(item)
        );
        
        // Se non ci sono prodotti reali, ma esiste un placeholder, mostra la categoria come vuota
        if (prodotti.length === 0 && esistePlaceholder) {
          return (
            <div key={cat} className="categoria-blocco">
              <div className="categoria-header">
                <h4>{cat} <span style={{fontSize: '0.8em', color: '#666', fontStyle: 'italic'}}>(vuota)</span></h4>
                <div className="categoria-actions">
                  <button className="elimina-cat" onClick={() => apriModalEliminaCategoria(cat)}>Elimina Categoria</button>
                </div>
              </div>
              <div className="categoria-vuota">
                <p>Questa categoria è vuota. Aggiungi prodotti per iniziare.</p>
              </div>
            </div>
          );
        }
        
        // Se non ci sono prodotti e non esiste neanche un placeholder, non mostrare la categoria
        if (prodotti.length === 0) {
          return null;
        }
        
        return (
          <div key={cat} className="categoria-blocco">
            <div className="categoria-header">
              <h4>{cat}</h4>
              <div className="categoria-actions">
                <button className="elimina-cat" onClick={() => apriModalEliminaCategoria(cat)}>Elimina Categoria</button>
              </div>
            </div>
            <ul>
              {prodotti.map(item => (
                <li key={item.id}>
                  <div className="prodotto-info">
                    <span className="prodotto-nome">{item.nome}</span>
                    <span className="prodotto-prezzo"> € {item.prezzo.toFixed(2)}</span>
                  </div>
                  <div className="prod-actions">
                    <button className="modifica" onClick={() => apriModifica(item)}>Modifica</button>
                    <button className="ordina" onClick={() => apriModalEliminaProdotto(item)}>Elimina</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* MODAL MODIFICA PRODOTTO *//*}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Modifica Prodotto</h3>
            <input type="text" value={modificaNome} onChange={e => setModificaNome(e.target.value)} />
            <input type="number" value={modificaPrezzo} onChange={e => setModificaPrezzo(e.target.value)} step="0.01" />
            <div className="modal-buttons">
              
              <button className="annulla" onClick={() => setShowModal(false)}>Chiudi</button>
              <button className="ok" onClick={salvaModifica}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUOVA VARIANTE *//*}
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
                <button className="btn-annulla" onClick={() => setShowModalVarianti(false)}>
                Annulla
              </button>
              <button className="btn-salva" onClick={aggiungiVariante}>
                Aggiungi Variante
              </button>
            
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICA VARIANTE *//*}
      {showModalModificaVariante && varianteDaModificare && (
        <div className="modal-backdrop">
          <div className="modal-varianti-globali">
            <div className="modal-header">
              <h3>Modifica Variante</h3>
              <button className="close-btn" onClick={() => setShowModalModificaVariante(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-variante">
                <div className="form-group">
                  <label>Nome Variante:</label>
                  <input 
                    type="text" 
                    value={modificaVarianteNome}
                    onChange={e => setModificaVarianteNome(e.target.value)}
                    className="input-variante"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo:</label>
                  <select 
                    value={modificaVarianteTipo} 
                    onChange={e => setModificaVarianteTipo(e.target.value)}
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
                      {modificaVarianteTipo === 'aggiunta' ? '+ €' : ''}
                    </span>
                    <input 
                      type="number" 
                      value={modificaVarianteCosto}
                      onChange={e => setModificaVarianteCosto(e.target.value)}
                      step="0.01"
                      min="0"
                      className="input-costo"
                      disabled={modificaVarianteTipo === 'rimozione'}
                    />
                  </div>
                  {modificaVarianteTipo === 'rimozione' && (
                    <p className="info-rimozione">Le rimozioni non hanno costo aggiuntivo</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
                  <button className="btn-annulla" onClick={() => setShowModalModificaVariante(false)}>
                Annulla
              </button>
              <button className="btn-salva" onClick={salvaModificaVariante}>
                Salva Modifiche
              </button>
          
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFERMA ELIMINA VARIANTE *//*}
      {showModalConfermaElimina && varianteDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione</h3>
              <button className="close-btn" onClick={() => setShowModalConfermaElimina(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la variante:</p>
                <p className="variante-da-eliminare">
                  <strong>{varianteDaEliminare.nome}</strong>
                  <span className={`variante-tipo ${varianteDaEliminare.tipo}`}>
                    {varianteDaEliminare.tipo === 'aggiunta' ? ` (+ €${varianteDaEliminare.costo.toFixed(2)})` : ' (Rimozione)'}
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
                <button className="btn-annulla" onClick={() => setShowModalConfermaElimina(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaVariante}>
                Elimina Variante
              </button>
            
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA CATEGORIA *//*}
      {showModalEliminaCategoria && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Categoria</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaCategoria(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la categoria:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.4rem', color: '#dc3545' }}>{categoriaDaEliminare}</strong>
                </p>
                <div className="avvertenza">
                  <p>⚠️ <strong>ATTENZIONE:</strong> Questa azione eliminerà:</p>
                  <ul>
                    <li>Tutti i prodotti nella categoria "{categoriaDaEliminare}"</li>
                    <li>La categoria stessa dal menù</li>
                  </ul>
                </div>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
               <button className="btn-annulla" onClick={() => setShowModalEliminaCategoria(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaCategoria}>
                Elimina Categoria
              </button>
             
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA PRODOTTO *//*}
      {showModalEliminaProdotto && prodottoDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Prodotto</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaProdotto(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare il prodotto:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.3rem' }}>{prodottoDaEliminare.nome}</strong>
                  <span style={{ color: '#495057', marginTop: '5px' }}>
                    Categoria: <strong>{prodottoDaEliminare.categoria}</strong>
                  </span>
                  <span style={{ color: '#28a745', marginTop: '5px' }}>
                    Prezzo: <strong>€ {prodottoDaEliminare.prezzo.toFixed(2)}</strong>
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
               <button className="btn-annulla" onClick={() => setShowModalEliminaProdotto(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaProdotto}>
                Elimina Prodotto
              </button>
             
            </div>
          </div>
        </div>
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}


*/


































import React, { useState, useEffect, useCallback } from 'react';
import './GestioneMenuPage.css';

export default function GestioneMenuPage() {
  const [menu, setMenu] = useState([]);
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [categoria, setCategoria] = useState(() => {
    return localStorage.getItem('ultima_categoria_menu') || '';
  });
  const [nuovaCategoria, setNuovaCategoria] = useState('');
  const [copertoAttivo, setCopertoAttivo] = useState(false);
  const [prezzoCoperto, setPrezzoCoperto] = useState('');
  const [msg, setMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modificaProdotto, setModificaProdotto] = useState(null);
  const [modificaNome, setModificaNome] = useState('');
  const [modificaPrezzo, setModificaPrezzo] = useState('');

  const [variantiGlobali, setVariantiGlobali] = useState([]);
  const [prodottoVariantiId, setProdottoVariantiId] = useState(null);
  
  // Modal per nuova variante
  const [showModalVarianti, setShowModalVarianti] = useState(false);
  const [nuovaVarianteNome, setNuovaVarianteNome] = useState('');
  const [nuovaVarianteCosto, setNuovaVarianteCosto] = useState('0.50');
  const [nuovaVarianteTipo, setNuovaVarianteTipo] = useState('aggiunta');
  
  // Modal per modifica variante
  const [showModalModificaVariante, setShowModalModificaVariante] = useState(false);
  const [varianteDaModificare, setVarianteDaModificare] = useState(null);
  const [modificaVarianteNome, setModificaVarianteNome] = useState('');
  const [modificaVarianteCosto, setModificaVarianteCosto] = useState('');
  const [modificaVarianteTipo, setModificaVarianteTipo] = useState('aggiunta');
  
  // Modal per conferma eliminazione variante
  const [showModalConfermaElimina, setShowModalConfermaElimina] = useState(false);
  const [varianteDaEliminare, setVarianteDaEliminare] = useState(null);

  // Modali per eliminazione categoria e prodotto
  const [showModalEliminaCategoria, setShowModalEliminaCategoria] = useState(false);
  const [categoriaDaEliminare, setCategoriaDaEliminare] = useState(null);
  const [showModalEliminaProdotto, setShowModalEliminaProdotto] = useState(false);
  const [prodottoDaEliminare, setProdottoDaEliminare] = useState(null);

  // 🔹 NUOVO: Stato per abilitazione varianti per categoria
  const [categorieConVarianti, setCategorieConVarianti] = useState({});

  const mostraMessaggio = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  const salvaCategoria = useCallback((cat) => {
    if (cat && cat !== 'nuova') {
      localStorage.setItem('ultima_categoria_menu', cat);
    }
  }, []);

  const trovaProdottoVarianti = useCallback((menuData) => {
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

  // 🔹 NUOVO: Carica impostazioni categorie
  const caricaImpostazioniCategorie = useCallback(() => {
    // Prima prova dal localStorage
    const localData = JSON.parse(localStorage.getItem('categorie_varianti') || '{}');
    
    if (Object.keys(localData).length > 0) {
      setCategorieConVarianti(localData);
      return;
    }
    
    // Se non c'è in localStorage, prova l'API
    fetch('https://qrcode-finale.onrender.com/api/categorie-impostazioni')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API not available');
      })
      .then(data => {
        setCategorieConVarianti(data);
      })
      .catch(() => {
        // Inizializza con tutte le categorie abilitate di default
        const categorie = [...new Set(menu
          .filter(item => 
            item.categoria && 
            item.categoria.trim() !== "" &&
            item.categoria !== "Configurazione"
          )
          .map(item => item.categoria)
        )];
        
        const defaultCategorie = {};
        categorie.forEach(cat => {
          defaultCategorie[cat] = true; // Di default le varianti sono abilitate
        });
        setCategorieConVarianti(defaultCategorie);
      });
  }, [menu]);

  const caricaMenu = useCallback(() => {
    fetch('https://qrcode-finale.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        trovaProdottoVarianti(data);
        // Carica impostazioni categorie
        caricaImpostazioniCategorie();
      })
      .catch(() => setMenu([]));
  }, [trovaProdottoVarianti, caricaImpostazioniCategorie]);

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

  const aggiornaCoperto = useCallback((attivo, prezzo) => {
    fetch('https://qrcode-finale.onrender.com/api/coperto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attivo, prezzo: prezzo ? parseFloat(prezzo) : 0 })
    });
  }, []);

  const toggleCoperto = useCallback(() => {
    const nuovoStato = !copertoAttivo;
    setCopertoAttivo(nuovoStato);
    aggiornaCoperto(nuovoStato, prezzoCoperto);
  }, [copertoAttivo, prezzoCoperto, aggiornaCoperto]);

  const cambiaPrezzoCoperto = useCallback((value) => {
    setPrezzoCoperto(value);
    if (copertoAttivo) aggiornaCoperto(true, value);
  }, [copertoAttivo, aggiornaCoperto]);

  // 🔹 NUOVO: Salva impostazioni categoria
  const salvaImpostazioniCategoria = useCallback((categoria, abilitato) => {
    // Salva in localStorage come fallback
    const impostazioni = JSON.parse(localStorage.getItem('categorie_varianti') || '{}');
    impostazioni[categoria] = abilitato;
    localStorage.setItem('categorie_varianti', JSON.stringify(impostazioni));
    
    // Aggiorna lo stato locale
    setCategorieConVarianti(impostazioni);
    
    // Prova a salvare sul server
    fetch('https://qrcode-finale.onrender.com/api/categorie-impostazioni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        categoria, 
        varianti_abilitate: abilitato 
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(() => {
        mostraMessaggio(`Varianti ${abilitato ? 'abilitate' : 'disabilitate'} per "${categoria}"`);
      })
      .catch(err => {
        console.error('Errore server:', err);
        mostraMessaggio(`Impostazioni salvate localmente per "${categoria}"`);
      });
  }, [mostraMessaggio]);

  // 🔹 NUOVO: Toggle varianti per categoria
  const toggleVariantiPerCategoria = useCallback((categoria) => {
    const attuale = categorieConVarianti[categoria] !== false; // true se undefined o true
    const nuovoStato = !attuale;
    salvaImpostazioniCategoria(categoria, nuovoStato);
  }, [categorieConVarianti, salvaImpostazioniCategoria]);

  const creaCategoriaVuota = useCallback(() => {
    if (!nuovaCategoria.trim()) {
      alert('Inserisci un nome per la categoria');
      return;
    }

    const prodottoPlaceholder = {
      nome: `__CATEGORIA_PLACEHOLDER__`,
      prezzo: 0.01,
      categoria: nuovaCategoria.trim(),
      placeholder: true
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodottoPlaceholder)
    })
      .then(() => {
        salvaCategoria(nuovaCategoria.trim());
        setCategoria(nuovaCategoria.trim());
        setNuovaCategoria('');
        caricaMenu();
        mostraMessaggio(`Categoria "${nuovaCategoria}" creata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nella creazione della categoria');
      });
  }, [nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

  const aggiungiProdotto = useCallback(() => {
    const categoriaFinale = categoria === 'nuova' ? nuovaCategoria : categoria;
    if (!nome || !prezzo || !categoriaFinale) {
      alert('Compila tutti i campi');
      return;
    }

    if (categoria === 'nuova' && nuovaCategoria.trim()) {
      const creaCategoriaEPoiProdotto = () => {
        const categoriaPlaceholder = {
          nome: `__CATEGORIA_PLACEHOLDER__`,
          prezzo: 0.01,
          categoria: nuovaCategoria.trim(),
          placeholder: true
        };

        return fetch('https://qrcode-finale.onrender.com/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaPlaceholder)
        })
          .then(() => {
            salvaCategoria(nuovaCategoria.trim());
            return nuovaCategoria.trim();
          });
      };

      creaCategoriaEPoiProdotto()
        .then(catCreata => {
          const prodottoReale = {
            nome,
            prezzo: parseFloat(prezzo),
            categoria: catCreata
          };

          return fetch('https://qrcode-finale.onrender.com/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prodottoReale)
          });
        })
        .then(() => {
          setNome('');
          setPrezzo('');
          setCategoria(nuovaCategoria.trim());
          setNuovaCategoria('');
          caricaMenu();
          mostraMessaggio('Categoria e prodotto creati!');
        })
        .catch(err => {
          console.error('Errore:', err);
          alert('Errore nella creazione');
        });
      
      return;
    }

    const prodotto = {
      nome,
      prezzo: parseFloat(prezzo),
      categoria: categoriaFinale
    };

    fetch('https://qrcode-finale.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodotto)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Errore nella risposta del server');
        }
        return res.json();
      })
      .then(() => {
        salvaCategoria(categoriaFinale);
        setNome('');
        setPrezzo('');
        caricaMenu();
        mostraMessaggio('Prodotto aggiunto con successo!');
      })
      .catch(err => {
        console.error('Errore completo:', err);
        alert('Errore nell\'aggiunta del prodotto: ' + err.message);
      });
  }, [nome, prezzo, categoria, nuovaCategoria, caricaMenu, mostraMessaggio, salvaCategoria]);

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
        caricaMenu();
        mostraMessaggio('Variante aggiunta!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiunta della variante');
      });
  }, [caricaMenu, mostraMessaggio]);

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
        mostraMessaggio('Variante aggiornata!');
      })
      .catch(err => {
        console.error('Errore:', err);
        alert('Errore nell\'aggiornamento delle varianti');
      });
  }, [prodottoVariantiId, mostraMessaggio]);

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

    if (prodottoVariantiId) {
      aggiornaProdottoVarianti([...variantiGlobali, nuovaVariante]);
    } else {
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
  ]);

  const apriModificaVariante = useCallback((variante) => {
    setVarianteDaModificare(variante);
    setModificaVarianteNome(variante.nome);
    setModificaVarianteCosto(variante.costo.toString());
    setModificaVarianteTipo(variante.tipo);
    setShowModalModificaVariante(true);
  }, []);

  const salvaModificaVariante = useCallback(() => {
    if (!modificaVarianteNome.trim()) {
      alert('Inserisci un nome per la variante');
      return;
    }

    const costo = parseFloat(modificaVarianteCosto) || 0;
    
    const nuoveVarianti = variantiGlobali.map(v => 
      v.id === varianteDaModificare.id 
        ? { 
            ...v, 
            nome: modificaVarianteNome.trim(), 
            costo: costo,
            tipo: modificaVarianteTipo
          }
        : v
    );
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante modificata!');
    }
    
    setShowModalModificaVariante(false);
    setVarianteDaModificare(null);
  }, [
    varianteDaModificare, 
    modificaVarianteNome, 
    modificaVarianteCosto, 
    modificaVarianteTipo, 
    variantiGlobali, 
    prodottoVariantiId, 
    aggiornaProdottoVarianti, 
    mostraMessaggio
  ]);

  const apriConfermaEliminaVariante = useCallback((variante) => {
    setVarianteDaEliminare(variante);
    setShowModalConfermaElimina(true);
  }, []);

  const confermaEliminaVariante = useCallback(() => {
    const nuoveVarianti = variantiGlobali.filter(v => v.id !== varianteDaEliminare.id);
    
    if (prodottoVariantiId) {
      aggiornaProdottoVarianti(nuoveVarianti);
    } else {
      setVariantiGlobali(nuoveVarianti);
      mostraMessaggio('Variante eliminata!');
    }
    
    setShowModalConfermaElimina(false);
    setVarianteDaEliminare(null);
  }, [variantiGlobali, varianteDaEliminare, prodottoVariantiId, aggiornaProdottoVarianti, mostraMessaggio]);

  // Funzioni per eliminazione con modali
  const apriModalEliminaCategoria = useCallback((cat) => {
    setCategoriaDaEliminare(cat);
    setShowModalEliminaCategoria(true);
  }, []);

  const confermaEliminaCategoria = useCallback(() => {
    if (!categoriaDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/categoria/${encodeURIComponent(categoriaDaEliminare)}`, { method: 'DELETE' })
      .then(() => {
        if (localStorage.getItem('ultima_categoria_menu') === categoriaDaEliminare) {
          localStorage.removeItem('ultima_categoria_menu');
          setCategoria('');
        }
        // Rimuovi anche dalle impostazioni
        const nuoveImpostazioni = { ...categorieConVarianti };
        delete nuoveImpostazioni[categoriaDaEliminare];
        setCategorieConVarianti(nuoveImpostazioni);
        localStorage.setItem('categorie_varianti', JSON.stringify(nuoveImpostazioni));
        
        setShowModalEliminaCategoria(false);
        setCategoriaDaEliminare(null);
        caricaMenu();
        mostraMessaggio(`Categoria "${categoriaDaEliminare}" eliminata!`);
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione della categoria');
      });
  }, [categoriaDaEliminare, categorieConVarianti, caricaMenu, mostraMessaggio]);

  const apriModalEliminaProdotto = useCallback((prodotto) => {
    setProdottoDaEliminare(prodotto);
    setShowModalEliminaProdotto(true);
  }, []);

  const confermaEliminaProdotto = useCallback(() => {
    if (!prodottoDaEliminare) return;
    
    fetch(`https://qrcode-finale.onrender.com/api/menu/${prodottoDaEliminare.id}`, { method: 'DELETE' })
      .then(() => {
        setShowModalEliminaProdotto(false);
        setProdottoDaEliminare(null);
        caricaMenu();
        mostraMessaggio('Prodotto eliminato!');
      })
      .catch(err => {
        console.error('Errore:', err);
        mostraMessaggio('Errore nell\'eliminazione del prodotto');
      });
  }, [prodottoDaEliminare, caricaMenu, mostraMessaggio]);

  const apriModifica = useCallback((prod) => {
    setModificaProdotto(prod);
    setModificaNome(prod.nome);
    setModificaPrezzo(prod.prezzo);
    setShowModal(true);
  }, []);

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

  useEffect(() => {
    caricaMenu();
    caricaCoperto();
  }, [caricaMenu, caricaCoperto]);

  // Funzione per identificare se un prodotto è un placeholder
  const isPlaceholder = (item) => {
    return (
      item.nome.includes('__CATEGORIA__') ||
      item.nome.includes('CATEGORIA_PLACEHOLDER') ||
      item.placeholder === true ||
      item.isCategoriaPlaceholder === true
    );
  };

  // Ottieni categorie reali (escludi "Configurazione")
  const categorie = [...new Set(menu
    .filter(item => 
      item.categoria && 
      item.categoria.trim() !== "" &&
      item.categoria !== "Configurazione"
    )
    .map(item => item.categoria)
  )];

  // Ottieni SOLO prodotti REALI per categoria (escludi TUTTI i placeholder)
  const getProdottiPerCategoria = (cat) => {
    return menu.filter(item => 
      item.categoria === cat && 
      !isPlaceholder(item) &&  // Escludi TUTTI i placeholder
      item.categoria !== "Configurazione"  // Escludi prodotti di configurazione
    );
  };

  return (
    <div className="gestione-container">
      <h2>Gestione Menù</h2>

      {/* SEZIONE 1: CREA NUOVA CATEGORIA VUOTA */}
      <div className="aggiungi-box">
        <h3>🔸 Crea Nuova Categoria</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome categoria" 
            value={nuovaCategoria}
            onChange={e => setNuovaCategoria(e.target.value)}
          />
          <button 
            onClick={creaCategoriaVuota}
            disabled={!nuovaCategoria.trim()}
          >
            + Crea Categoria
          </button>
        </div>
      </div>

      {/* SEZIONE 2: AGGIUNGI PRODOTTO */}
      <div className="aggiungi-box">
        <h3>🔸 Aggiungi Prodotto</h3>
        <div className="aggiungi-form">
          <input 
            type="text" 
            placeholder="Nome pietanza" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Prezzo" 
            value={prezzo} 
            onChange={e => setPrezzo(e.target.value)} 
            step="0.01" 
          />
          <select 
            value={categoria} 
            onChange={(e) => {
              setCategoria(e.target.value);
              if (e.target.value && e.target.value !== 'nuova') {
                salvaCategoria(e.target.value);
              }
            }}
          >
            <option value="">Seleziona categoria</option>
            {categorie.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="nuova">+ Nuova categoria</option>
          </select>
          {categoria === 'nuova' && (
            <input 
              type="text" 
              placeholder="Nuova categoria" 
              value={nuovaCategoria} 
              onChange={e => setNuovaCategoria(e.target.value)} 
            />
          )}
          <button onClick={aggiungiProdotto}>Aggiungi</button>
        </div>
      </div>

      {/* GESTIONE VARIANTI GLOBALI */}
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
                    {variante.tipo === 'aggiunta' ? `+ €${variante.costo.toFixed(2)}` : ' - Senza '}
                  </span>
                </div>
                <div className="variante-actions">
                  <button 
                    className="btn-modifica" 
                    onClick={() => apriModificaVariante(variante)}
                  >
                    Modifica
                  </button>
                  <button 
                    className="btn-elimina" 
                    onClick={() => apriConfermaEliminaVariante(variante)}
                  >
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
        {copertoAttivo && (
          <input 
            type="number" 
            placeholder="Prezzo coperto" 
            value={prezzoCoperto} 
            onChange={e => cambiaPrezzoCoperto(e.target.value)} 
            step="0.01" 
          />
        )}
      </div>

      {/* Categorie e prodotti - MOSTRA SOLO PRODOTTI REALI */}
      <h3>Prodotti per Categoria</h3>
      {categorie.map(cat => {
        const prodotti = getProdottiPerCategoria(cat);
        
        // Controlla se la categoria esiste solo come placeholder
        const esistePlaceholder = menu.some(item => 
          item.categoria === cat && isPlaceholder(item)
        );
        
        // 🔹 Verifica se le varianti sono abilitate per questa categoria
        const variantiAbilitate = categorieConVarianti[cat] !== false;
        
        // Se non ci sono prodotti reali, ma esiste un placeholder, mostra la categoria come vuota
        if (prodotti.length === 0 && esistePlaceholder) {
          return (
            <div key={cat} className="categoria-blocco">
              <div className="categoria-header">
                <div className="categoria-title">
                  <h4>{cat} <span style={{fontSize: '0.8em', color: '#666', fontStyle: 'italic'}}>(vuota)</span></h4>
                  {/* 🔹 Toggle per varianti */}
                  <div className="toggle-varianti-categoria">
                    <span>Varianti: </span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={variantiAbilitate}
                        onChange={() => toggleVariantiPerCategoria(cat)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className={`toggle-status ${variantiAbilitate ? 'abilitato' : 'disabilitato'}`}>
                      {variantiAbilitate ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
                <div className="categoria-actions">
                  <button className="elimina-cat" onClick={() => apriModalEliminaCategoria(cat)}>Elimina Categoria</button>
                </div>
              </div>
              <div className="categoria-vuota">
                <p>Questa categoria è vuota. Aggiungi prodotti per iniziare.</p>
              </div>
            </div>
          );
        }
        
        // Se non ci sono prodotti e non esiste neanche un placeholder, non mostrare la categoria
        if (prodotti.length === 0) {
          return null;
        }
        
        return (
          <div key={cat} className="categoria-blocco">
            <div className="categoria-header">
              <div className="categoria-title">
                <h4>{cat}</h4>
                {/* 🔹 Toggle per varianti */}
                <div className="toggle-varianti-categoria">
                  <span>Varianti: </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={variantiAbilitate}
                      onChange={() => toggleVariantiPerCategoria(cat)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className={`toggle-status ${variantiAbilitate ? 'abilitato' : 'disabilitato'}`}>
                    {variantiAbilitate ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <div className="categoria-actions">
                <button className="elimina-cat" onClick={() => apriModalEliminaCategoria(cat)}>Elimina Categoria</button>
              </div>
            </div>
            <ul>
              {prodotti.map(item => (
                <li key={item.id}>
                  <div className="prodotto-info">
                    <span className="prodotto-nome">{item.nome}</span>
                    <span className="prodotto-prezzo"> € {item.prezzo.toFixed(2)}</span>
                  </div>
                  <div className="prod-actions">
                    <button className="modifica" onClick={() => apriModifica(item)}>Modifica</button>
                    <button className="ordina" onClick={() => apriModalEliminaProdotto(item)}>Elimina</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* MODAL MODIFICA PRODOTTO */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-coperto">
            <h3>Modifica Prodotto</h3>
            <input type="text" value={modificaNome} onChange={e => setModificaNome(e.target.value)} />
            <input type="number" value={modificaPrezzo} onChange={e => setModificaPrezzo(e.target.value)} step="0.01" />
            <div className="modal-buttons">
              <button className="annulla" onClick={() => setShowModal(false)}>Chiudi</button>
              <button className="ok" onClick={salvaModifica}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUOVA VARIANTE */}
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
              <button className="btn-annulla" onClick={() => setShowModalVarianti(false)}>
                Annulla
              </button>
              <button className="btn-salva" onClick={aggiungiVariante}>
                Aggiungi Variante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICA VARIANTE */}
      {showModalModificaVariante && varianteDaModificare && (
        <div className="modal-backdrop">
          <div className="modal-varianti-globali">
            <div className="modal-header">
              <h3>Modifica Variante</h3>
              <button className="close-btn" onClick={() => setShowModalModificaVariante(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-variante">
                <div className="form-group">
                  <label>Nome Variante:</label>
                  <input 
                    type="text" 
                    value={modificaVarianteNome}
                    onChange={e => setModificaVarianteNome(e.target.value)}
                    className="input-variante"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo:</label>
                  <select 
                    value={modificaVarianteTipo} 
                    onChange={e => setModificaVarianteTipo(e.target.value)}
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
                      {modificaVarianteTipo === 'aggiunta' ? '+ €' : ''}
                    </span>
                    <input 
                      type="number" 
                      value={modificaVarianteCosto}
                      onChange={e => setModificaVarianteCosto(e.target.value)}
                      step="0.01"
                      min="0"
                      className="input-costo"
                      disabled={modificaVarianteTipo === 'rimozione'}
                    />
                  </div>
                  {modificaVarianteTipo === 'rimozione' && (
                    <p className="info-rimozione">Le rimozioni non hanno costo aggiuntivo</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-annulla" onClick={() => setShowModalModificaVariante(false)}>
                Annulla
              </button>
              <button className="btn-salva" onClick={salvaModificaVariante}>
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFERMA ELIMINA VARIANTE */}
      {showModalConfermaElimina && varianteDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione</h3>
              <button className="close-btn" onClick={() => setShowModalConfermaElimina(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la variante:</p>
                <p className="variante-da-eliminare">
                  <strong>{varianteDaEliminare.nome}</strong>
                  <span className={`variante-tipo ${varianteDaEliminare.tipo}`}>
                    {varianteDaEliminare.tipo === 'aggiunta' ? ` (+ €${varianteDaEliminare.costo.toFixed(2)})` : ' (Rimozione)'}
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-annulla" onClick={() => setShowModalConfermaElimina(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaVariante}>
                Elimina Variante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA CATEGORIA */}
      {showModalEliminaCategoria && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Categoria</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaCategoria(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare la categoria:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.4rem', color: '#dc3545' }}>{categoriaDaEliminare}</strong>
                </p>
                <div className="avvertenza">
                  <p>⚠️ <strong>ATTENZIONE:</strong> Questa azione eliminerà:</p>
                  <ul>
                    <li>Tutti i prodotti nella categoria "{categoriaDaEliminare}"</li>
                    <li>La categoria stessa dal menù</li>
                  </ul>
                </div>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-annulla" onClick={() => setShowModalEliminaCategoria(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaCategoria}>
                Elimina Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINA PRODOTTO */}
      {showModalEliminaProdotto && prodottoDaEliminare && (
        <div className="modal-backdrop">
          <div className="modal-conferma">
            <div className="modal-header">
              <h3>Conferma Eliminazione Prodotto</h3>
              <button className="close-btn" onClick={() => setShowModalEliminaProdotto(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="conferma-messaggio">
                <p>Sei sicuro di voler eliminare il prodotto:</p>
                <p className="variante-da-eliminare">
                  <strong style={{ fontSize: '1.3rem' }}>{prodottoDaEliminare.nome}</strong>
                  <span style={{ color: '#495057', marginTop: '5px' }}>
                    Categoria: <strong>{prodottoDaEliminare.categoria}</strong>
                  </span>
                  <span style={{ color: '#28a745', marginTop: '5px' }}>
                    Prezzo: <strong>€ {prodottoDaEliminare.prezzo.toFixed(2)}</strong>
                  </span>
                </p>
                <p className="avviso">Questa azione non può essere annullata.</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-annulla" onClick={() => setShowModalEliminaProdotto(false)}>
                Annulla
              </button>
              <button className="btn-conferma-elimina" onClick={confermaEliminaProdotto}>
                Elimina Prodotto
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}