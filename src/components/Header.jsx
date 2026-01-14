import React, { useState } from 'react';
import ContactForm from './ContactForm';
import logoAzul from '../assets/images/logo_SIAM_AZUL.png';
import { useCompany } from '../context/CompanyContext';

// Silhouette placeholder for users without photo
const USER_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

/**
 * Componente Header (Encabezado).
 * Contiene el logo de la entidad, navegación de herramientas, perfil de usuario logueado 
 * y botón de acceso/cierre de sesión. Es responsivo.
 */
const Header = ({ onMenuClick }) => {
    // Estado para controlar la visibilidad del formulario de contacto
    const [showContact, setShowContact] = useState(false);

    // Obtención de datos globales desde el contexto de la compañía
    const {
        companyData,
        loading,
        mUSUARIO_IDENTICADO,
        v_nom_trb,
        v_user_photo,
        confirmLogin
    } = useCompany();

    /**
     * Cierra la sesión del usuario.
     */
    const handleLogout = () => {
        confirmLogin(false);
    };

    /**
     * Muestra el modal de contacto.
     */
    const handleContactClick = (e) => {
        e.preventDefault();
        setShowContact(true);
    };

    const handleClose = () => setShowContact(false);

    return (
        <>
            <header className="saas-header">
                {/* Bloque Izquierdo: Marca y Datos de la Entidad */}
                <div className="header-left">
                    <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Menu">
                        ☰
                    </button>
                    <img src={logoAzul} alt="SIAM Logo" className="brand-logo-img" title="SIAM - Sistema de Inteligencia Administrativa" />

                    {/* Información de la Empresa (se oculta en dispositivos muy pequeños) */}
                    {!loading && companyData && (
                        <div className="company-info-container">
                            <span style={{ fontWeight: 'bold' }}>{companyData.mNOM_EN1}</span>
                            <span>{companyData.mNOM_EN2}</span>
                            <span>RUC Nº {companyData.mRUC_EJE}</span>
                        </div>
                    )}
                </div>

                {/* Bloque Central: Navegación de Herramientas */}
                <nav className="header-center">
                    <ul className="tool-nav">
                        <li className="active">
                            <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>
                                <span className="icon">🕒</span> Inicio
                            </a>
                        </li>
                        <li><a href="#"><span className="icon">▦</span> Proyectos</a></li>
                        <li>
                            <a href="#" onClick={handleContactClick}>
                                <span className="icon">🔍</span> Contactos
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Bloque Derecho: Perfil de Usuario o Acceso */}
                <div className="header-right">
                    {!mUSUARIO_IDENTICADO ? (
                        // Botón de Acceso si no está identificado
                        <button
                            className="create-btn"
                            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => window.dispatchEvent(new CustomEvent('OPEN_LOGIN'))}
                        >
                            <span style={{ fontSize: '1.2rem' }}>🔐</span> Acceder
                        </button>
                    ) : (
                        // Información del Usuario Autenticado
                        <div className="user-profile-header">
                            <div className="user-name-display">
                                <span className="user-name-text" title={v_nom_trb}>{v_nom_trb || 'Usuario'}</span>
                            </div>

                            {/* Avatar Circular */}
                            <div className="avatar-container">
                                <img
                                    src={v_user_photo ? `data:image/jpeg;base64,${v_user_photo}` : USER_PLACEHOLDER}
                                    alt="Avatar"
                                    className="avatar-img"
                                />
                            </div>

                            {/* Botón Cerrar Sesión (Estilizado en index.css) */}
                            <button
                                onClick={handleLogout}
                                className="logout-icon-btn"
                                title="Cerrar Sesión"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Modal de Contacto (Glassmorphism) */}
            {showContact && <ContactForm onClose={handleClose} />}
        </>
    );
};

export default Header;
