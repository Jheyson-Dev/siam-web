import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './ContactFormPublic.css';

/**
 * Formulario de Contacto Público
 * Accesible sin autenticación para campañas de marketing
 * URL: /contacto o /contacto?eje=X
 */
const ContactFormPublic = () => {
    const [formData, setFormData] = useState({
        nom_ent: '',
        ape_nom: '',
        car_goo: '',
        cor_ele: '',
        cel_wha: '',
        obs_des: ''
    });
    const [status, setStatus] = useState(null);
    const [publicIp, setPublicIp] = useState('');

    // Capturar IP pública y parámetro eje de la URL
    useEffect(() => {
        // Capturar IP pública
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setPublicIp(data.ip))
            .catch(err => console.error('Error obteniendo IP pública:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setStatus('sending');

            // Obtener ide_eje de parámetro URL (opcional)
            const urlParams = new URLSearchParams(window.location.search);
            const ideEje = urlParams.get('eje') ? parseInt(urlParams.get('eje')) : null;

            const response = await fetch(`${API_BASE_URL}/api/mantenimiento/siam/contactos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ide_eje: ideEje,
                    i_p_pub: publicIp
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ nom_ent: '', ape_nom: '', car_goo: '', cor_ele: '', cel_wha: '', obs_des: '' });
            } else {
                const err = await response.json();
                setStatus('error:' + (err.error || 'unknown'));
            }
        } catch (err) {
            setStatus('error:' + err.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="contact-public-page">
                <div className="contact-public-container">
                    <div className="success-card">
                        <div className="success-icon">🎉</div>
                        <h1>¡Mensaje Enviado!</h1>
                        <p>Gracias por contactarnos.</p>
                        <p className="success-subtitle">
                            Nuestro equipo se pondrá en contacto contigo a la brevedad.
                        </p>
                        <button
                            onClick={() => setStatus(null)}
                            className="btn-send-another"
                        >
                            Enviar otro mensaje
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-public-page">
            <div className="contact-public-container">
                <div className="contact-public-header">
                    <div className="logo-area">
                        <h1 className="brand-title">SIAM<span className="brand-soft">soft</span></h1>
                        <p className="brand-tagline">Soluciones Integrales para tu Municipalidad</p>
                    </div>
                </div>

                <div className="contact-public-form-wrapper">
                    <h2 className="form-title">Contáctanos</h2>
                    <p className="form-subtitle">
                        Cuéntanos sobre tu proyecto y nos comunicaremos contigo.
                    </p>

                    {status && status.startsWith('error:') && (
                        <div className="alert-error">
                            Error al enviar mensaje. Intenta nuevamente.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="public-contact-form">
                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="nom_ent">Nombre de la Entidad *</label>
                                <input
                                    type="text"
                                    id="nom_ent"
                                    name="nom_ent"
                                    value={formData.nom_ent}
                                    onChange={handleChange}
                                    placeholder="Municipalidad de..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="ape_nom">Apellidos y Nombres *</label>
                                <input
                                    type="text"
                                    id="ape_nom"
                                    name="ape_nom"
                                    value={formData.ape_nom}
                                    onChange={handleChange}
                                    placeholder="Tu nombre completo"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="car_goo">Cargo / Puesto *</label>
                                <input
                                    type="text"
                                    id="car_goo"
                                    name="car_goo"
                                    value={formData.car_goo}
                                    onChange={handleChange}
                                    placeholder="Ej: Gerente de TI"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row two-cols">
                            <div className="form-field">
                                <label htmlFor="cel_wha">Celular / WhatsApp *</label>
                                <input
                                    type="tel"
                                    id="cel_wha"
                                    name="cel_wha"
                                    value={formData.cel_wha}
                                    onChange={handleChange}
                                    placeholder="999 999 999"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="cor_ele">Correo Electrónico *</label>
                                <input
                                    type="email"
                                    id="cor_ele"
                                    name="cor_ele"
                                    value={formData.cor_ele}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="obs_des">Cuéntanos sobre tu necesidad *</label>
                                <textarea
                                    id="obs_des"
                                    name="obs_des"
                                    value={formData.obs_des}
                                    onChange={handleChange}
                                    placeholder="Descripción de lo que necesitas (Software de Rentas, Sistema de Trámites, etc.)"
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit-public"
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </form>

                    <div className="contact-info-footer">
                        <p>
                            <strong>Email:</strong> siamsoft2013@gmail.com |
                            <strong> WhatsApp:</strong> +51 XXX XXX XXX
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactFormPublic;
