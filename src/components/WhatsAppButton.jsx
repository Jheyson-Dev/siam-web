import React from 'react';
import { useCompany } from '../context/CompanyContext';
// Usaremos un icono SVG simple de WhatsApp

const WhatsAppButton = () => {
    const { companyData, loading } = useCompany();

    if (loading || !companyData.mCEL_MOV) {
        return null;
    }

    const handleClick = () => {
        const phoneNumber = companyData.mCEL_MOV.replace(/\D/g, ''); // Eliminar no numéricos
        window.open(`https://wa.me/${phoneNumber}`, '_blank');
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                cursor: 'pointer',
                backgroundColor: '#25D366',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease'
            }}
            onClick={handleClick}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            title="Contáctanos por WhatsApp"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="white"
            >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.601 2.231.332 4.024 1.484 5.397.104.125.14.288.094.444l-.803 2.766 2.723-.715c.162-.041.334.001.455.108 0 0 .193 0 .537.301zm5.117-3.518c-.249.124-.51.109-.767-.042-1.634-.961-2.96-2.287-3.922-3.921-.151-.257-.166-.518-.042-.767 1.393-2.772 1.082-3.238.163-4.664-.199-.309-.434-.339-.757-.164-.265.142-.511.23-.746.368-1.083.636-1.597 1.884-.816 3.656 1.134 2.571 3.031 4.468 5.602 5.602 1.777.784 3.024.27 3.66- .812.138-.235.226-.481.368-.746.175-.323.145-.558-.164-.757-1.426- .919-1.892-1.23-4.664.163.001-.001-.001-.001.085.084z" />
            </svg>
        </div>
    );
};

export default WhatsAppButton;
