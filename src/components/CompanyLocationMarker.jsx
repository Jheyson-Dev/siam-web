import React, { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { useCompany } from '../context/CompanyContext';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const CompanyLocationMarker = () => {
    const { companyData, loading } = useCompany();
    const map = useMap();

    const { mLAT_EJE, mLON_EJE, mNOM_EN1, mNOM_EN2 } = companyData;

    useEffect(() => {
        if (!map || !mLAT_EJE || !mLON_EJE) return;

        const position = [parseFloat(mLAT_EJE), parseFloat(mLON_EJE)];

        const handleFlyTo = () => {
            map.flyTo(position, 16, {
                duration: 2
            });
        };

        const CustomControl = L.Control.extend({
            onAdd: function () {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
                btn.innerHTML = '🏢 Oficina principal SIAMsoft';
                btn.style.backgroundColor = 'white';
                btn.style.border = 'none';
                btn.style.padding = '10px';
                btn.style.cursor = 'pointer';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.gap = '5px';
                btn.style.fontWeight = 'bold';
                btn.style.color = '#333';
                btn.style.fontSize = '14px';
                btn.title = "Ir a la Sede Central";

                btn.onclick = (e) => {
                    L.DomEvent.stopPropagation(e);
                    handleFlyTo();
                };

                return btn;
            }
        });

        const control = new CustomControl({ position: 'bottomleft' });
        control.addTo(map);

        return () => {
            map.removeControl(control);
        };
    }, [map, mLAT_EJE, mLON_EJE, mNOM_EN1]); // Agregué mNOM_EN1 al array de dependencias para evitar warnings, aunque no es critico

    if (loading || !mLAT_EJE || !mLON_EJE) return null;

    const position = [parseFloat(mLAT_EJE), parseFloat(mLON_EJE)];

    const handleOpenGoogleMaps = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${mLAT_EJE},${mLON_EJE}`, '_blank');
    };

    return (
        <Marker position={position}>
            <Popup>
                <div style={{ textAlign: 'center' }}>
                    <strong>{mNOM_EN1}</strong><br />
                    {mNOM_EN2}<br />
                    <button
                        onClick={handleOpenGoogleMaps}
                        style={{
                            marginTop: '5px',
                            padding: '5px 10px',
                            backgroundColor: '#4285F4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cómo llegar
                    </button>
                </div>
            </Popup>
        </Marker>
    );
};

export default CompanyLocationMarker;
