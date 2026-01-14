import React from 'react';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container" style={{ textAlign: 'center' }}>
                <h2>Conecte con Nosotros</h2>
                <div className="social-links">
                    <a href="https://www.facebook.com/SIAMSoftSftwareparamunicipalidades" target="_blank" rel="noopener noreferrer" className="social-btn">
                        Facebook
                    </a>
                    <a href="https://www.youtube.com/@siamsoft" target="_blank" rel="noopener noreferrer" className="social-btn">
                        YouTube
                    </a>
                    <a href="#" className="social-btn">
                        TikTok
                    </a>
                </div>
                <p style={{ marginTop: '2rem', color: '#64748b' }}>
                    &copy; {new Date().getFullYear()} SIAM S.R.L. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
