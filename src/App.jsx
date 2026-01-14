import React, { useState, useEffect } from 'react';
import Header from './components/Header';
// import Footer from './components/Footer'; // Footer global quizás ya no es necesario o se simplifica
import MapTerritorio from './components/MapTerritorio';
import Sidebar from './components/Sidebar';
import RegistroSolicitudAltaModal from './components/RegistroSolicitudAltaModal';
import AutorizacionServicioNotarial from './components/AutorizacionServicioNotarial';

import { CompanyProvider, useCompany } from './context/CompanyContext';
import WhatsAppButton from './components/WhatsAppButton';
import FormLogin from './components/FormLogin';

import ContactForm from './components/ContactForm'; // Importar ContactForm

function App() {
  const { mUSUARIO_IDENTICADO } = useCompany();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false); // Estado para Contacto

  // Nuevo estado para acciones pendientes tras login
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const handleOpenLogin = (e) => {
      if (e.detail && e.detail.pendingAction) {
        setPendingAction(e.detail.pendingAction);
      }
      setShowLoginModal(true);
    };
    window.addEventListener('OPEN_LOGIN', handleOpenLogin);
    return () => window.removeEventListener('OPEN_LOGIN', handleOpenLogin);
  }, []);

  // Efecto para procesar acciones pendientes cuando el login es exitoso
  useEffect(() => {
    if (mUSUARIO_IDENTICADO && pendingAction === 'OPEN_AUTORIZACION') {
      setShowAuthModal(true);
      setPendingAction(null); // Limpiar acción
    }
  }, [mUSUARIO_IDENTICADO, pendingAction]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenAlta = () => {
    setShowAltaModal(true);
    setMobileOpen(false); // Cerrar sidebar movil si está abierto
  };

  const handleOpenAutorizacion = () => {
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  return (
    <>
      {showLoginModal && (
        <FormLogin
          onClose={(isSuccess) => {
            setShowLoginModal(false);
            // Solo cancelamos la acción si NO fue un login exitoso
            // Esto evita que se borre la intención antes de que el mUSUARIO_IDENTICADO se actualice
            if (!isSuccess) setPendingAction(null);
          }}
        />
      )}
      <div className="app">
        <Header onMenuClick={toggleMobileSidebar} />

        <div className="main-layout">
          <Sidebar
            collapsed={isSidebarCollapsed}
            toggle={toggleSidebar}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            onOpenAlta={handleOpenAlta}
            onOpenAutorizacion={handleOpenAutorizacion}
          />

          <main className="content-area">
            <MapTerritorio onOpenContact={() => setShowContactModal(true)} />
          </main>
        </div>

        {showAltaModal && <RegistroSolicitudAltaModal onClose={() => setShowAltaModal(false)} />}
        {showAuthModal && <AutorizacionServicioNotarial onClose={() => setShowAuthModal(false)} />}
        {showContactModal && (
          <div className="contact-modal">
            <div className="contact-content-wrapper" style={{ background: 'white', padding: '20px', borderRadius: '10px', position: 'relative', maxWidth: '500px', width: '90%' }}>
              <button onClick={() => setShowContactModal(false)} className="modal-close-btn">✕</button>
              <ContactForm onClose={() => setShowContactModal(false)} />
            </div>
          </div>
        )}
        <WhatsAppButton />
      </div>
    </>
  );
}

export default App;
