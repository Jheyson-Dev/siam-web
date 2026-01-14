import React, { useState } from 'react';
import ComponentLabel from './ComponentLabel';
import { useCompany } from '../context/CompanyContext';

const Sidebar = ({ collapsed, toggle, mobileOpen, setMobileOpen, onOpenAlta, onOpenAutorizacion }) => {
    const { mUSUARIO_IDENTICADO } = useCompany();

    // Estado para controlar qué secciones están abiertas
    const [openSections, setOpenSections] = useState({
        notarias: true,
        munis: true,
        products: true
    });

    // Definición de ítems del menú. 
    // Los marcados como 'protected: true' requieren autenticación previa.
    const navItems = [
        { icon: '📝', label: 'Solicitud de Alta', color: '#e0f2fe', iconColor: '#0ea5e9' },
        { icon: '🔏', label: 'Autorizaciones / Permisos', color: '#dcfce7', iconColor: '#22c55e', protected: true },
        { icon: '⚖️', label: 'SIAMsoft Notarial', color: '#f3e8ff', iconColor: '#a855f7' },
    ];

    const toolsItems = [
        { icon: '🗺️', label: 'Servicios Catastrales', color: '#f3f4f6', iconColor: '#6b7280' },
        { icon: '🧾', label: 'Servicios de Emisión Masiva de Cuponeras', color: '#f3f4f6', iconColor: '#6b7280' },
        { icon: '🤝', label: 'Asesoría y Consultoría', color: '#f3f4f6', iconColor: '#6b7280' },
    ];

    const productItems = [
        { icon: '💰', label: 'Software de Gestión Tributaria y Caja', color: '#fee2e2', iconColor: '#ef4444' },
        { icon: '🏘️', label: 'Software de Catastro Municipal', color: '#ffedd5', iconColor: '#f97316' },
        { icon: '⏰', label: 'Software de Control de Asistencia y Planillas', color: '#fef3c7', iconColor: '#d97706' },
        { icon: '📂', label: 'Software de Trámite Documentario', color: '#ecfccb', iconColor: '#65a30d' },
        { icon: '🗄️', label: 'Software de Archivo Central', color: '#ccfbf1', iconColor: '#0d9488' },
        { icon: '🥛', label: 'Software de Vaso de Leche', color: '#e0f2fe', iconColor: '#0284c7' },
        { icon: '🆔', label: 'Software de Registro Civil', color: '#e0e7ff', iconColor: '#4f46e5' },
        { icon: '🧾', label: 'Software de Facturación Electrónica FACTUsoft', color: '#fae8ff', iconColor: '#d946ef' },
        { icon: '🏙️', label: 'SMARTcity', color: '#caf0f8', iconColor: '#0077b6' },
    ];

    /**
     * Maneja el clic en cualquier elemento del menú.
     * Implementa lógica de protección de rutas y acciones especiales.
     */
    const handleItemClick = (item, e) => {
        e.preventDefault();

        // Acción especial para Solicitud de Alta
        if (item.label === 'Solicitud de Alta') {
            if (onOpenAlta) onOpenAlta();
            // Cerramos el menú en móvil tras seleccionar
            if (mobileOpen) setMobileOpen(false);
            return;
        }

        // Acción especial para Autorizaciones / Permisos
        if (item.label === 'Autorizaciones / Permisos') {
            if (!mUSUARIO_IDENTICADO) {
                window.dispatchEvent(new CustomEvent('OPEN_LOGIN', {
                    detail: { pendingAction: 'OPEN_AUTORIZACION' }
                }));
                // Cerramos el menú en móvil también aquí para que no tape el login
                if (mobileOpen) setMobileOpen(false);
                return;
            }
            if (onOpenAutorizacion) onOpenAutorizacion();
            if (mobileOpen) setMobileOpen(false);
            return;
        }

        // Simulación de navegación (Logger)
        console.log(`Navegando a: ${item.label}`);
        if (mobileOpen) setMobileOpen(false);
    };

    /**
     * Alterna la visibilidad de una sección del menú.
     */
    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <>
            {/* Capa de fondo oscura para móvil: Bloquea el resto de la app cuando el menú está abierto */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`saas-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-content">

                    {/* Sección 1: Notarias */}
                    <div className="nav-section">
                        <h3 className="nav-category" onClick={() => toggleSection('notarias')}>
                            Notarias Públicas
                            <span className={`nav-chevron ${openSections.notarias ? 'open' : ''}`}>⌄</span>
                        </h3>
                        {openSections.notarias && (
                            <ul className="nav-list">
                                {navItems.map((item, idx) => (
                                    <li key={idx} className={`nav-item ${item.active ? 'active' : ''}`}>
                                        <a href="#" onClick={(e) => handleItemClick(item, e)}>
                                            <div className="item-icon" style={{ backgroundColor: item.color, color: item.iconColor }}>{item.icon}</div>
                                            <span className="item-label">{item.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Sección 2: Municipalidades */}
                    <div className="nav-section">
                        <h3 className="nav-category" onClick={() => toggleSection('munis')}>
                            Municipalidades
                            <span className={`nav-chevron ${openSections.munis ? 'open' : ''}`}>⌄</span>
                        </h3>
                        {openSections.munis && (
                            <ul className="nav-list">
                                {toolsItems.map((item, idx) => (
                                    <li key={idx} className="nav-item">
                                        <a href="#" onClick={(e) => handleItemClick(item, e)}>
                                            <div className="item-icon" style={{ backgroundColor: item.color, color: item.iconColor }}>{item.icon}</div>
                                            <span className="item-label">{item.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Sección 3: Productos */}
                    <div className="nav-section">
                        <h3 className="nav-category" onClick={() => toggleSection('products')}>
                            Productos
                            <span className={`nav-chevron ${openSections.products ? 'open' : ''}`}>⌄</span>
                        </h3>
                        {openSections.products && (
                            <ul className="nav-list">
                                {productItems.map((item, idx) => (
                                    <li key={idx} className="nav-item">
                                        <a href="#" onClick={(e) => handleItemClick(item, e)}>
                                            <div className="item-icon" style={{ backgroundColor: item.color, color: item.iconColor }}>{item.icon}</div>
                                            <span className="item-label">{item.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer del Sidebar */}
                    <div className="sidebar-footer">
                        <a href="#">Términos de Servicio</a>
                        <a href="#">Privacidad</a>
                        <span>SIAM 2026 v1.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
