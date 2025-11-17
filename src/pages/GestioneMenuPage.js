
// GestioneMenuPage.jsx
import React, { useState, useEffect } from 'react';
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

      {/* Aggiungi prodotto */}
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

      {/* Gestione coperto */}
      <div className="coperto-box">
        <h3>Gestione Coperto</h3>
        <label>
          <input type="checkbox" checked={copertoAttivo} onChange={toggleCoperto} />
          Attiva Coperto
        </label>
        {copertoAttivo && <input type="number" placeholder="Prezzo coperto" value={prezzoCoperto} onChange={e => cambiaPrezzoCoperto(e.target.value)} />}
      </div>

      {/* Categorie e prodotti */}
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

      {/* Modal modifica prodotto */}
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
