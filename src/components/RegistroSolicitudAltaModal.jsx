import React, { useState, useEffect } from 'react';
import ComponentLabel from './ComponentLabel';
import './RegistroSolicitudAltaModal.css';
import { API_BASE_URL } from '../config';

/**
 * Componente Modal para el Registro de Solicitud de Alta de Servicio Notarial.
 * Permite buscar personas por DNI y notarias por nombre/RUC, capturando IP pública y datos de contacto.
 * Diseño responsivo con cabecera y pie de página fijos.
 */
const RegistroSolicitudAltaModal = ({ onClose }) => {
    // Estado interno del paso o wizard (expandible en el futuro)
    const [step, setStep] = useState(1);
    // Captura de IP Pública para auditoría de seguridad
    const [publicIp, setPublicIp] = useState('');

    // Objeto centralizado de datos del formulario
    const [formData, setFormData] = useState({
        dni: '',
        ide_per: null,
        pat_per: '',
        mat_per: '',
        nom_per: '',

        busquedaNotaria: '',
        ide_not: null,
        nombreNotaria: '',
        direccionNotaria: '',

        celular: '',
        email: '',
        observacion: ''
    });

    const [notariasEncontradas, setNotariasEncontradas] = useState([]);
    const [loadingPersona, setLoadingPersona] = useState(false);
    const [loadingNotaria, setLoadingNotaria] = useState(false);
    const [status, setStatus] = useState(null); // Tipos: 'error' | 'warning' | 'loading' | 'info'
    const [isSubmitted, setIsSubmitted] = useState(false); // Flag para pantalla final de éxito

    /**
     * Obtiene la IP Pública del cliente al montar el componente.
     */
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setPublicIp(data.ip))
            .catch(err => console.error('Error obteniendo IP:', err));
    }, []);

    // --- Handlers para Persona (DNI) ---

    /**
     * Busca los datos de una persona por su DNI en el backend.
     */
    const handleBuscarPersona = async () => {
        if (!formData.dni || formData.dni.length !== 8) {
            setStatus({ type: 'error', message: 'Ingrese un DNI válido de 8 dígitos.' });
            return;
        }
        setLoadingPersona(true);
        setStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/persona/${formData.dni}`);
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    ide_per: data.ide_per,
                    pat_per: data.pat_per,
                    mat_per: data.mat_per,
                    nom_per: data.nom_per
                }));
                setStatus({ type: 'info', message: 'Persona identificada correctamente.' });
            } else {
                setStatus({ type: 'error', message: 'No se encontró información para este DNI.' });
                // Limpiar campos asociados a la persona
                setFormData(prev => ({ ...prev, ide_per: null, pat_per: '', mat_per: '', nom_per: '' }));
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error de comunicación al buscar datos de la persona.' });
        } finally {
            setLoadingPersona(false);
        }
    };

    // --- Handlers para Notaria ---

    /**
     * Realiza una búsqueda de notarias por coincidencia de nombre o RUC.
     */
    const handleBuscarNotaria = async () => {
        if (!formData.busquedaNotaria) return;
        setLoadingNotaria(true);
        setStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/notarias/search?q=${formData.busquedaNotaria}`);
            if (response.ok) {
                const data = await response.json();
                setNotariasEncontradas(data);
                if (data.length === 0) setStatus({ type: 'warning', message: 'No se encontraron notarias con el criterio ingresado.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error de red al consultar el catálogo de notarias.' });
        } finally {
            setLoadingNotaria(false);
        }
    };

    /**
     * Selecciona una notaría de la lista de resultados.
     */
    const handleSelectNotaria = (notaria) => {
        setFormData(prev => ({
            ...prev,
            ide_not: notaria.ide_not,
            nombreNotaria: notaria.nom_com,
            direccionNotaria: notaria.dir_not,
            busquedaNotaria: '' // Se limpia para ocultar los resultados
        }));
        setNotariasEncontradas([]);
    };

    // --- Proceso de Envío ---

    /**
     * Valida y registra la solicitud de alta en el servidor.
     * Ahora se invoca manualmente desde el botón "Enviar" para evitar submits accidentales.
     */
    const handleRegistroManual = async () => {
        // Validaciones previas obligatorias
        if (!formData.ide_per) {
            setStatus({ type: 'error', message: 'Debe identificar primero al solicitante mediante su DNI.' });
            return;
        }
        if (!formData.ide_not) {
            setStatus({ type: 'error', message: 'Debe seleccionar una notaría válida del listado.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Registrando solicitud en el sistema...' });

        try {
            const payload = {
                ide_per: formData.ide_per,
                ide_not: formData.ide_not, // Asegurar que es numérico si es necesario
                nro_wha: formData.celular,
                cor_ele: formData.email,
                obs_sol: formData.observacion,
                nro_dni: formData.dni, // Extra por si acaso
                i_p_pub: publicIp // IP Pública obtenida del cliente
            };

            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/solicitud-alta-notaria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                setStatus({ type: 'info', message: `¡Solicitud #${result.solicitud.nro_sol} registrada exitosamente!` });
            } else if (response.status === 409) {
                // Conflicto / Duplicado
                const sol = result.solicitud;
                const estado = sol.flg_apr === 1 ? 'APROBADA' : 'EN TRÁMITE';
                setStatus({
                    type: 'error',
                    message: `Existe una solicitud activa (#${sol.nro_sol}) para esta notaría con estado: ${estado}. Registrada el ${new Date(sol.fch_sol).toLocaleDateString()}.`
                });
            } else {
                setStatus({ type: 'error', message: result.error || 'Ocurrió un error inesperado al procesar el registro.' });
            }

        } catch (error) {
            console.error('Error Persona:', error);
            setStatus({ type: 'error', message: 'No se pudo establecer conexión con el servidor.' });
        }
    };

    /**
     * Actualiza el estado del formulario ante cambios en los inputs.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si cambia el texto de búsqueda de notaría, limpiar la selección previa para evitar confusión
        if (name === 'busquedaNotaria') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ide_not: null,
                nombreNotaria: '',
                direccionNotaria: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Si se ha enviado con éxito, mostrar pantalla de confirmación dedicada
    if (isSubmitted) {
        return (
            <div className="alta-modal-overlay">
                <div className="alta-modal-content success-screen-content">
                    <div className="success-icon">🎉</div>
                    <h2 className="success-title">¡Solicitud Enviada!</h2>
                    <p className="success-message">
                        {status?.message || 'Su solicitud ha sido registrada correctamente.'}
                    </p>
                    <button
                        onClick={onClose}
                        className="btn-registrar btn-success-close"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="alta-modal-overlay" onClick={(e) => { if (e.target.className === 'alta-modal-overlay') onClose(); }}>
            <div className="alta-modal-content">

                {/* Cabecera del Modal */}
                <div className="alta-modal-header" style={{ position: 'relative' }}>
                    <button
                        onClick={onClose}
                        className="modal-close-btn-alta"
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        ×
                    </button>
                    <div className="header-title-row" style={{ paddingRight: '40px' }}>
                        <h2>Solicitud de Alta - Servicio Notarial</h2>
                        <span className="alta-badge">SIAMsoft Notarias</span>
                    </div>
                    <p className="header-subtitle">Complete los datos para generar un nuevo ticket de inscripción.</p>
                </div>

                {/* Cuerpo del Modal con Scroll */}
                <div className="alta-modal-body">
                    {/* Mensajes de Estado (Error/Warning) */}
                    {status && status.type !== 'success' && (
                        <div className={`status-msg status-${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    <div className="alta-form-container">

                        {/* 1. Datos del Solicitante (Persona) */}
                        <section className="alta-form-section section-applicant">
                            <h3 className="alta-section-title">1. Identificación del Solicitante</h3>

                            <div className="alta-fields-grid">
                                {/* Búsqueda DNI */}
                                <div className="dni-search-container">
                                    <div className="alta-field">
                                        <label>DNI</label>
                                        <input
                                            type="text"
                                            name="dni"
                                            value={formData.dni}
                                            onChange={handleChange}
                                            placeholder="Ingrese DNI"
                                            maxLength={8}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleBuscarPersona();
                                                }
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={handleBuscarPersona} disabled={loadingPersona} className="verify-btn">
                                        {loadingPersona ? '...' : 'Verificar'}
                                    </button>
                                </div>
                                {/* Datos Autocompletados */}
                                <div className="alta-field">
                                    <label>Apellidos</label>
                                    <input type="text" value={`${formData.pat_per} ${formData.mat_per}`.trim()} readOnly disabled placeholder="Apellidos del solicitante" />
                                </div>
                                <div className="alta-field">
                                    <label>Nombres</label>
                                    <input type="text" value={formData.nom_per} readOnly disabled placeholder="Nombres del solicitante" />
                                </div>
                            </div>
                        </section>

                        {/* 2. Datos de la Notaría */}
                        <section className="alta-form-section section-notary">
                            <h3 className="alta-section-title">2. Catálogo de Notaría</h3>

                            <div className="alta-fields-grid">
                                <div className="alta-field" style={{ position: 'relative' }}>
                                    <label>Localizar Notaría (Nombre / Apellido)</label>
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            name="busquedaNotaria"
                                            value={formData.busquedaNotaria}
                                            onChange={handleChange}
                                            placeholder="Ej: Notaria Perez, RUC 20123456789"
                                            className="search-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleBuscarNotaria();
                                                }
                                            }}
                                        />
                                        <button type="button" onClick={handleBuscarNotaria} disabled={loadingNotaria} className="search-btn">
                                            {loadingNotaria ? '...' : '🔍'}
                                        </button>
                                    </div>
                                    {/* Lista desplegable de resultados */}
                                    {notariasEncontradas.length > 0 && (
                                        <ul className="floating-results-list">
                                            {notariasEncontradas.map(not => (
                                                <li key={not.ide_not} onClick={() => handleSelectNotaria(not)}>
                                                    <div className="result-name">{not.nom_com}</div>
                                                    <div className="result-detail">RUC: {not.nro_doc} • {not.dir_not}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="alta-field">
                                    <label>Notaría Seleccionada</label>
                                    <input type="text" value={formData.nombreNotaria} readOnly disabled className="selected-entity-input" placeholder="Ninguna notaría seleccionada" />
                                </div>
                                <div className="alta-field field-full-width">
                                    <label>Ubicación</label>
                                    <input type="text" value={formData.direccionNotaria} readOnly disabled title={formData.direccionNotaria} placeholder="Dirección de la notaría" />
                                </div>
                            </div>
                        </section>

                        {/* 3. Datos de Contacto */}
                        <section className="alta-form-section section-contact">
                            <h3 className="alta-section-title">3. Canales de Comunicación</h3>
                            <div className="alta-fields-grid">
                                <div className="alta-field">
                                    <label>WhatsApp de Contacto</label>
                                    <input type="tel" name="celular" value={formData.celular} onChange={handleChange} required placeholder="900000000" />
                                </div>
                                <div className="alta-field">
                                    <label>E-mail</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="usuario@notaria.com" />
                                </div>
                                <div className="alta-field field-full-width">
                                    <label>Notas Adicionales / Observaciones</label>
                                    <textarea name="observacion" value={formData.observacion} onChange={handleChange} rows="4" placeholder="Ej: Necesitamos acceso para 3 usuarios..."></textarea>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Pie de Página Fijo con Acciones */}
                <div className="alta-modal-footer">
                    <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
                    <button
                        type="button"
                        onClick={handleRegistroManual}
                        className="btn-registrar"
                        disabled={!formData.ide_per || !formData.ide_not || status?.type === 'loading'}
                    >
                        {status?.type === 'loading' ? 'Enviando...' : 'Enviar Solicitud ✓'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistroSolicitudAltaModal;
