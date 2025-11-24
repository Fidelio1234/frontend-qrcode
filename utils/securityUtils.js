// ✅ CARICA CONFIGURAZIONE SICUREZZA
export const caricaConfigurazioneSicurezza = async () => {
  try {
    const response = await fetch('/codice-sicurezza.json');
    return await response.json();
  } catch (error) {
    console.error('❌ Errore caricamento configurazione:', error);
    return {
      codice: '1234',
      attivo: true,
      timeoutMinuti: 15,
      ultimoAccesso: null
    };
  }
};

// ✅ VERIFICA SCADENZA
export const verificaScadenzaAccesso = () => {
  const ultimoAccesso = localStorage.getItem('ultimoAccesso');
  if (!ultimoAccesso) return true; // Scaduto
  
  const dataAccesso = new Date(ultimoAccesso);
  const dataOra = new Date();
  const minutiTrascorsi = (dataOra - dataAccesso) / (1000 * 60);
  
  return minutiTrascorsi > 15; // 15 minuti
};

// ✅ AGGIORNA ACCESSO
export const aggiornaAccesso = () => {
  localStorage.setItem('ultimoAccesso', new Date().toISOString());
};