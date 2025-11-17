import React, { useState, useEffect } from 'react';
import './LicenseModal.css';

const LicenseModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(null);

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    try {
      console.log('🔍 Frontend: Inizio verifica licenza...');
      
      const response = await fetch('https://qrcode-finale.onrender.com/api/license/status');
      const data = await response.json();
      
      console.log('📊 Frontend: Dati ricevuti:', data);
      console.log('🔑 Frontend: valid value:', data.license?.valid);
      console.log('📝 Frontend: full license object:', data.license);
      
      setLicenseStatus(data);
      
      // ✅ CORREGGI: controlla data.license.valid invece di data.valid
      if (!data.license?.valid) {
        console.log('🚫 Frontend: Licenza non valida - Mostro modal');
        setShowModal(true);
      } else {
        console.log('✅ Frontend: Licenza valida - Nascondo modal');
        setShowModal(false);
      }
      
    } catch (error) {
      console.error('❌ Frontend: Errore verifica licenza:', error);
    }
  };

  if (!showModal) return null;

  return (
    <div className="license-modal-overlay">
      <div className="license-modal">
        <div className="modal-header">
          <h2>⚠️ Problema Licenza</h2>
        </div>
        <div className="modal-content">
          <div className="license-details">
            <p><strong>Stato:</strong> {licenseStatus?.license?.valid ? 'Valida' : 'Non Valida'}</p>
            <p><strong>Motivo:</strong> {licenseStatus?.license?.reason || 'Nessun motivo specificato'}</p>
            <p><strong>Tipo:</strong> {licenseStatus?.license?.type || 'N/A'}</p>
            <p><strong>Giorni rimanenti:</strong> {licenseStatus?.license?.daysRemaining || '0'}</p>
          </div>
          
          <div className="action-buttons">
            <button onClick={() => window.location.reload()} className="btn-retry">
              🔄 Ricarica Pagina
            </button>
            <button onClick={() => setShowModal(false)} className="btn-close">
              ❌ Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseModal;