import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import './FormLogin.css';
import logoAzul from '../assets/images/logo_SIAM_AZUL.png';
import logoSiam from '../assets/images/logo_SIAM_AZUL.png';

// Silhouette placeholder for users without photo
const USER_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

/**
 * Componente de Formulario de Login Avanzado.
 * Implementa identificación de usuario onBlur, verificación de password MD5,
 * y persistencia de sesión a través de localStorage (solo usuario y foto).
 */
const FormLogin = ({ onClose }) => {
    // Hooks de contexto para datos de empresa y lógica de autenticación
    const {
        companyData,
        identify,
        login,
        confirmLogin,
        mUSUARIO_IDENTICADO,
        v_nlineno,
        v_user_photo,
        v_nom_trb
    } = useCompany();

    // Estados locales para el formulario
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [greeting, setGreeting] = useState('');

    // Referencia para el campo de password (autofoco tras identificación)
    const passwordRef = React.useRef(null);

    /**
     * Efecto inicial: Recupera el usuario desde localStorage si se marcó "recordar".
     */
    React.useEffect(() => {
        const savedUser = localStorage.getItem('siam_remembered_user');
        if (savedUser) {
            setUsername(savedUser);
            setRemember(true);
        }
    }, []);

    // Si el usuario ya está identificado, cerramos el componente/modal.
    if (mUSUARIO_IDENTICADO) return null;

    /**
     * Evento al salir del campo Usuario: Busca al usuario en la BD.
     */
    const handleUserBlur = async () => {
        setLoginError('');
        setGreeting('');

        if (username.trim()) {
            const userData = await identify(username);
            if (userData) {
                setGreeting(`¡Hola, ${userData.nom_trb || username}!`);

                // Autofoco al password para agilizar el ingreso
                if (passwordRef.current) {
                    passwordRef.current.focus();
                }
            } else {
                setLoginError('Usuario no encontrado');
            }
        }
    };

    /**
     * Evento al salir del campo Password: Valida la clave sin loguear.
     */
    const handlePasswordBlur = async () => {
        if (password.trim() && v_nlineno) {
            const success = await login(v_nlineno, password);
            if (!success) {
                setLoginError('clave incorrecta');
            } else {
                setLoginError('');
            }
        }
    };

    /**
     * Procesa el inicio de sesión definitivo al pulsar Aceptar.
     */
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoginError('');

        if (!v_nlineno) {
            setLoginError('Primero identifíquese con un usuario válido');
            return;
        }

        const success = await login(v_nlineno, password);

        if (success) {
            // Manejo de caché local para "Recordar Usuario"
            if (remember) {
                localStorage.setItem('siam_remembered_user', username);
                if (v_user_photo) localStorage.setItem('siam_remembered_photo', v_user_photo);
            } else {
                localStorage.removeItem('siam_remembered_user');
                localStorage.removeItem('siam_remembered_photo');
            }

            confirmLogin(true); // Finaliza el proceso en el Contexto
            if (onClose) onClose(true); // Señalizamos éxito para redirecciones
        } else {
            setLoginError('clave incorrecta');
        }
    };

    /**
     * Cierra el modal sin realizar acciones.
     */
    const handleExit = () => {
        if (onClose) onClose(false);
    };

    return (
        <div className="login-overlay">
            <div className="login-card">

                <div className="login-content-grid">
                    {/* COLUMNA IZQUIERDA: DATOS ENTIDAD */}
                    <div className="login-section-left">
                        <div className="section-header">DATOS DE LA ENTIDAD</div>
                        <div className="section-body">
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img src={logoAzul} alt="Logo Entidad" style={{ height: '80px', objectFit: 'contain' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ruc</label>
                                <input type="text" className="form-input" value={companyData?.mRUC_EJE || ''} disabled />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Empresa</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={`${companyData?.mNOM_EN1 || ''} ${companyData?.mNOM_EN2 || ''}`.trim()}
                                    disabled
                                    style={{ resize: 'none' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: USUARIO */}
                    <div className="login-section-right">
                        <div className="section-header">IDENTIFICACIÓN DEL USUARIO</div>
                        <div className="section-body">
                            <div className="user-login-layout">
                                <img
                                    src={v_user_photo ? `data:image/jpeg;base64,${v_user_photo}` : USER_PLACEHOLDER}
                                    alt="Usuario"
                                    className="user-photo-large"
                                />

                                <form className="user-inputs-container" autoComplete="off" onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label className="form-label">Usuario</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onBlur={handleUserBlur}
                                            autoFocus
                                            autoComplete="off"
                                            spellCheck="false"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-input"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onBlur={handlePasswordBlur}
                                                ref={passwordRef}
                                                autoComplete="new-password"
                                                spellCheck="false"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '1.1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: '#94a3b8'
                                                }}
                                            >
                                                {showPassword ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                    </div>

                                    {greeting && <div style={{ color: '#2563eb', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>{greeting}</div>}
                                    {loginError && <div style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>{loginError}</div>}

                                    <div className="checkbox-group">
                                        <input type="checkbox" id="chkRemember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                        <label htmlFor="chkRemember">Recordar Usuario</label>
                                    </div>

                                    <div className="login-actions">
                                        <button type="submit" className="btn btn-accept">Aceptar ✓</button>
                                        <button type="button" className="btn btn-exit" onClick={handleExit}>Salir ✕</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOGIN FOOTER */}
                <div className="login-footer">
                    <img src={logoSiam} alt="SIAM Logo" className="siam-logo-footer-white" />
                    <span>Copyright (c) 2026 By SIAMsoft - Todos los derechos reservados.</span>
                </div>

            </div>
        </div >
    );
};

export default FormLogin;
