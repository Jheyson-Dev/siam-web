import React, { useState, useEffect } from 'react';
import './AutorizacionServicioNotarial.css';
import { API_BASE_URL } from '../config';

/**
 * Componente: AutorizacionServicioNotarial
 * Permite gestionar las solicitudes de alta y visualizar los servicios autorizados.
 * Solo accesible tras autenticación (verificado en Sidebar/App).
 */
const AutorizacionServicioNotarial = ({ onClose }) => {
    // Estado para controlar la pestaña activa: 'solicitudes' o 'autorizados'
    const [activeTab, setActiveTab] = useState('solicitudes');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notaryData, setNotaryData] = useState([]); // Almacena las solicitudes reales

    // Estado para el diálogo de confirmación personalizado
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        nro_sol: null,
        nom_not: ''
    });

    /**
     * Obtiene los datos reales del servidor.
     */
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/notary-requests`);
            if (response.ok) {
                const data = await response.json();
                setNotaryData(data);
            }
        } catch (error) {
            console.error('Error al refrescar datos:', error);
        } finally {
            // Retornamos una promesa para que el llamante pueda esperar el delay visual
            return new Promise(resolve => {
                setTimeout(() => {
                    setIsRefreshing(false);
                    resolve();
                }, 400); // Reducido para mayor agilidad
            });
        }
    };


    // Disparar refresh automáticamente SOLO al cargar el componente inicial
    useEffect(() => {
        handleRefresh();
    }, []); // Dependencia vacía para que solo ocurra una vez al montar

    /**
     * Muestra el diálogo de confirmación.
     */
    const handleApproveTrigger = (nro_sol, nom_not) => {
        setConfirmModal({
            show: true,
            nro_sol,
            nom_not
        });
    };

    /**
     * Procesa la aprobación real tras confirmar.
     */
    const handleConfirmApprove = async () => {
        const { nro_sol } = confirmModal;
        setConfirmModal({ ...confirmModal, show: false }); // Cerramos modal rápido
        setIsRefreshing(true); // Efecto visual de carga

        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/approve-request/${nro_sol}`, {
                method: 'PUT'
            });

            if (response.ok) {
                await handleRefresh(); // Acción automática de actualización
            } else {
                alert('No se pudo procesar la aprobación.');
                setIsRefreshing(false);
            }
        } catch (error) {
            console.error('Error al aprobar:', error);
            alert('Error de conexión.');
            setIsRefreshing(false);
        }
    };


    /**
     * Procesa la suspensión o reactivación de una notaría.
     */
    const handleSuspend = async (nro_sol, currentSus) => {
        const newSus = currentSus === 1 ? 0 : 1;
        setIsRefreshing(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/suspend-request/${nro_sol}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flg_sus: newSus })
            });

            if (response.ok) {
                await handleRefresh(); // Acción automática de actualización
            } else {
                alert('No se pudo actualizar el estado de suspensión.');
                setIsRefreshing(false);
            }
        } catch (error) {
            console.error('Error al suspender:', error);
            alert('Error de conexión.');
            setIsRefreshing(false);
        }
    };



    /**
     * Renderiza la tabla según la pestaña activa y los datos filtrados.
     */
    const renderTable = () => {
        const filtered = notaryData.filter(item => {
            if (activeTab === 'solicitudes') {
                return item.flg_apr === 0;
            } else if (activeTab === 'autorizados') {
                // En la pestaña de autorizados, mostrar solo si flg_apr = 1 Y NO está suspendido (flg_sus != 1)
                return item.flg_apr === 1 && item.flg_sus !== 1;
            } else if (activeTab === 'suspendidos') {
                // En la pestaña de suspendidos, mostrar solo los que tienen flg_sus = 1
                return item.flg_sus === 1;
            }
            return false;
        });



        if (filtered.length === 0) {
            return (
                <div className="auth-empty-state">
                    <div className="empty-icon">{activeTab === 'solicitudes' ? '📂' : '🛡️'}</div>
                    <h3>{activeTab === 'solicitudes' ? 'Sin Solicitudes Pendientes' : 'Sin Notarías Autorizadas'}</h3>
                    <p>No se encontraron registros en la base de datos.</p>
                </div>
            );
        }

        return (
            <>
                {/* VISTA DE ESCRITORIO: TABLA */}
                <div className="auth-table-wrapper desktop-only">
                    <table className="auth-data-table">
                        <thead>
                            <tr>
                                <th>Nº Sol.</th>
                                <th>Fecha</th>
                                <th>DNI Notario</th>
                                <th>Notario</th>
                                <th>DNI Solicitante</th>
                                <th>Solicitante</th>
                                <th>Celular</th>
                                <th>Email</th>
                                {activeTab === 'solicitudes' && <th>Apr.</th>}
                                {activeTab === 'autorizados' && <th>Fch. Aprobación</th>}
                                {activeTab === 'autorizados' && <th className="txt-center">Sus.</th>}
                                {activeTab === 'suspendidos' && <th>Fch. Suspensión</th>}
                                {activeTab === 'suspendidos' && <th className="txt-center">Reactivar</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="txt-center font-bold">{row.nro_sol}</td>
                                    <td>{row.fch_sol ? new Date(row.fch_sol).toLocaleString() : '-'}</td>
                                    <td>{row.dni_not}</td>
                                    <td className="txt-primary">{row.nom_not}</td>
                                    <td>{row.dni_sol}</td>
                                    <td>{row.nom_sol}</td>
                                    <td className="txt-whatsapp">{row.nro_wha}</td>
                                    <td className="txt-email">{row.cor_ele}</td>
                                    {activeTab === 'solicitudes' && (
                                        <td className="txt-center">
                                            <input
                                                type="checkbox"
                                                checked={row.flg_apr === 1}
                                                onChange={() => handleApproveTrigger(row.nro_sol, row.nom_not)}
                                                className="auth-checkbox"
                                                title="Clic para Aprobar esta Notaría"
                                            />
                                        </td>
                                    )}
                                    {activeTab === 'autorizados' && (
                                        <td className="txt-success">
                                            {row.fch_apr ? new Date(row.fch_apr).toLocaleString() : '-'}
                                        </td>
                                    )}
                                    {activeTab === 'autorizados' && (
                                        <td className="txt-center">
                                            <input
                                                type="checkbox"
                                                checked={row.flg_sus === 1}
                                                onChange={() => handleSuspend(row.nro_sol, row.flg_sus)}
                                                className="auth-checkbox sus-checkbox"
                                                title="Clic para Suspender/Reactivar"
                                            />
                                        </td>
                                    )}
                                    {activeTab === 'suspendidos' && (
                                        <td className="txt-error">
                                            {row.fch_sus ? new Date(row.fch_sus).toLocaleString() : '-'}
                                        </td>
                                    )}
                                    {activeTab === 'suspendidos' && (
                                        <td className="txt-center">
                                            <button
                                                className="reactivate-btn"
                                                onClick={() => handleSuspend(row.nro_sol, row.flg_sus)}
                                                title="Regresar a Autorizados"
                                            >
                                                🔓
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VISTA MÓVIL: TARJETAS (CARDS) */}
                <div className="auth-cards-container mobile-only">
                    {filtered.map((row, idx) => (
                        <div key={idx} className={`auth-card-item ${row.flg_sus === 1 ? 'suspended-card' : ''}`}>
                            <div className="card-header">
                                <span className="card-nro">Nº {row.nro_sol}</span>
                                <span className="card-date">{row.fch_sol ? new Date(row.fch_sol).toLocaleDateString() : '-'}</span>
                            </div>

                            <div className="card-body">
                                <div className="card-row">
                                    <span className="card-label">Notario:</span>
                                    <span className="card-value txt-primary">{row.nom_not}</span>
                                </div>
                                <div className="card-row">
                                    <span className="card-label">Solicitante:</span>
                                    <span className="card-value">{row.nom_sol}</span>
                                </div>
                                <div className="card-row">
                                    <span className="card-label">Celular:</span>
                                    <span className="card-value txt-whatsapp">{row.nro_wha}</span>
                                </div>
                                <div className="card-row">
                                    <span className="card-label">Email:</span>
                                    <span className="card-value txt-email">{row.cor_ele}</span>
                                </div>

                                {activeTab === 'autorizados' && (
                                    <div className="card-row status-row">
                                        <span className="card-label">Aprobado:</span>
                                        <span className="card-value txt-success">
                                            {row.fch_apr ? new Date(row.fch_apr).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                )}

                                {activeTab === 'suspendidos' && (
                                    <div className="card-row status-row">
                                        <span className="card-label">Suspendido:</span>
                                        <span className="card-value txt-error">
                                            {row.fch_sus ? new Date(row.fch_sus).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {activeTab === 'solicitudes' && (
                                    <button
                                        className="btn-card-approve"
                                        onClick={() => handleApproveTrigger(row.nro_sol, row.nom_not)}
                                    >
                                        🛡️ Aprobar Acceso
                                    </button>
                                )}

                                {activeTab === 'autorizados' && (
                                    <button
                                        className="btn-card-suspend"
                                        onClick={() => handleSuspend(row.nro_sol, row.flg_sus)}
                                    >
                                        🚫 Suspender Servicio
                                    </button>
                                )}

                                {activeTab === 'suspendidos' && (
                                    <button
                                        className="btn-card-reactivate"
                                        onClick={() => handleSuspend(row.nro_sol, row.flg_sus)}
                                    >
                                        🔓 Reactivar Acceso
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal-content">

                {/* Cabecera del Componente */}
                <div className="auth-modal-header">
                    <div className="auth-header-info">
                        <h2>Autorización de Servicio Notarial</h2>
                        <div className="auth-header-actions">
                            <span className="auth-badge">Gestión Administrativa</span>
                            <button
                                className={`auth-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                title="Refrescar lista"
                            >
                                <span className="refresh-icon">🔄</span>
                                <span className="refresh-text">{isRefreshing ? 'Cargando...' : 'Actualizar'}</span>
                            </button>
                        </div>
                    </div>
                    <button className="auth-close-x" onClick={onClose} title="Cerrar">×</button>
                </div>

                {/* Navegación por Pestañas y Botón Refresh */}
                <div className="auth-tabs-container">
                    <div className="auth-tabs-nav">
                        <button
                            className={`auth-tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('solicitudes')}
                        >
                            <span className="tab-icon">📥</span>
                            Solicitudes de Alta
                        </button>
                        <button
                            className={`auth-tab-btn ${activeTab === 'autorizados' ? 'active' : ''}`}
                            onClick={() => setActiveTab('autorizados')}
                        >
                            <span className="tab-icon">✅</span>
                            Autorizados
                        </button>
                        <button
                            className={`auth-tab-btn ${activeTab === 'suspendidos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suspendidos')}
                        >
                            <span className="tab-icon">🚫</span>
                            Suspendidos
                        </button>
                    </div>
                </div>

                {/* Contenido Dinámico según Pestaña */}
                <div className="auth-modal-body">
                    {isRefreshing ? (
                        <div className="auth-loading-screen">
                            <div className="spinner-large"></div>
                            <p>Sincronizando con el servidor...</p>
                        </div>
                    ) : (
                        <div className="auth-view-container">
                            {renderTable()}
                        </div>
                    )}
                </div>

                {/* Pie de Página con Botón de Salida */}
                <div className="auth-modal-footer">
                    <button className="auth-exit-btn" onClick={onClose}>
                        <span className="exit-icon">🚪</span> Salir
                    </button>
                </div>

                {/* Sub-Modal de Confirmación Premium */}
                {confirmModal.show && (
                    <div className="confirm-overlay">
                        <div className="confirm-card">
                            <div className="confirm-icon-wrapper">
                                <span className="confirm-main-icon">🛡️</span>
                            </div>
                            <h3>Confirmar Aprobación</h3>
                            <p>¿Está seguro de que desea aprobar el acceso de la notaría?</p>
                            <div className="confirm-details">
                                <div className="detail-item">
                                    <span className="detail-label">Nº Solicitud:</span>
                                    <span className="detail-value">{confirmModal.nro_sol}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Notaría:</span>
                                    <span className="detail-value">{confirmModal.nom_not}</span>
                                </div>
                            </div>
                            <div className="confirm-actions">
                                <button className="btn-cancel" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                    Cancelar
                                </button>
                                <button className="btn-confirm" onClick={handleConfirmApprove}>
                                    Sí, Aprobar Notaría
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutorizacionServicioNotarial;
