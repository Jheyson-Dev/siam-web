import React, { useState, useEffect } from 'react';
import ComponentLabel from './ComponentLabel';
import { PIDE_EJE_CURRENT } from '../config';
import './ContactForm.css';

const ContactForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        nom_ent: '',
        ape_nom: '',
        car_goo: '',
        cor_ele: '',
        cel_wha: '',
        obs_des: ''
    });
    const [status, setStatus] = useState(null); // 'sending', 'success', 'error'
    const [publicIp, setPublicIp] = useState('');

    // Capturar IP pública al montar el componente
    useEffect(() => {
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
            const response = await fetch('/api/mantenimiento/siam/contactos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, ide_eje: PIDE_EJE_CURRENT, i_p_pub: publicIp })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ nom_ent: '', ape_nom: '', car_goo: '', cor_ele: '', cel_wha: '', obs_des: '' });
                setTimeout(() => {
                    if (onClose) onClose();
                }, 3500);
            } else {
                const err = await response.json();
                setStatus('error');
                console.error(err);
            }
        } catch (err) {
            setStatus('error');
            console.error(err);
        }
    };

    if (status === 'success') {
        return (
            <div className="contact-modal-overlay" onClick={onClose}>
                <div className="contact-modal-box" onClick={(e) => e.stopPropagation()}>
                    <div className="success-message">
                        <span className="success-icon-large">🎉</span>
                        <h2 className="success-text">¡Mensaje Enviado!</h2>
                        <p className="success-subtext">Tu solicitud ha sido registrada correctamente.<br />Pronto nos pondremos en contacto contigo.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-modal-overlay" onClick={onClose}>
            <div className="contact-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>

                <div className="contact-form-container">
                    <ComponentLabel name="ContactForm" />

                    <div className="contact-header">
                        <h2 className="contact-title">Contáctanos</h2>
                        <p className="contact-subtitle">¿Listo para transformar tu gestión municipal?</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="contact-form-group">
                            <label className="contact-label">Entidad</label>
                            <input
                                type="text"
                                name="nom_ent"
                                value={formData.nom_ent}
                                onChange={handleChange}
                                placeholder="Ej. Municipalidad Distrital de..."
                                className="contact-input"
                                required
                            />
                        </div>

                        <div className="form-row-grid">
                            <div className="contact-form-group">
                                <label className="contact-label">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="ape_nom"
                                    value={formData.ape_nom}
                                    onChange={handleChange}
                                    placeholder="Tus Nombres y Apellidos"
                                    className="contact-input"
                                    required
                                />
                            </div>

                            <div className="contact-form-group">
                                <label className="contact-label">Cargo</label>
                                <input
                                    type="text"
                                    name="car_goo"
                                    value={formData.car_goo}
                                    onChange={handleChange}
                                    placeholder="Ej. Gerente de Rentas"
                                    className="contact-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row-grid">
                            <div className="contact-form-group">
                                <label className="contact-label">Celular / WhatsApp</label>
                                <input
                                    type="tel"
                                    name="cel_wha"
                                    value={formData.cel_wha}
                                    onChange={handleChange}
                                    placeholder="999 888 777"
                                    className="contact-input"
                                    required
                                />
                            </div>

                            <div className="contact-form-group">
                                <label className="contact-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="cor_ele"
                                    value={formData.cor_ele}
                                    onChange={handleChange}
                                    placeholder="nombre@entidad.gob.pe"
                                    className="contact-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="contact-form-group">
                            <label className="contact-label">¿En qué podemos ayudarte?</label>
                            <textarea
                                name="obs_des"
                                value={formData.obs_des}
                                onChange={handleChange}
                                placeholder="Describa brevemente su requerimiento o consulta..."
                                className="contact-textarea"
                                rows="4"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className={`btn-submit-premium ${status === 'sending' ? 'loading' : ''}`}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Enviando Solicitud...' : 'Enviar Mensaje Ahora'}
                        </button>

                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        {status === 'error' && (
                            <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                                Hubo un error al enviar. Por favor intente nuevamente.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
