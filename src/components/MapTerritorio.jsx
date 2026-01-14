import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, GeoJSON, useMap, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import MapSearch from './MapSearch';
import CompanyLocationMarker from './CompanyLocationMarker';

// Helper para parsear JSON de forma segura (definido fuera para usar en FitBounds también si fuera necesario, pero lo duplicaré o moveré dentro del componente principal si es más fácil, aqui lo defino localmente dentro de FitBounds para no romper scope)
const safeParseJSON = (str) => {
    try {
        if (typeof str === 'object' && str !== null) return str;
        return JSON.parse(str);
    } catch (e) {
        console.warn("Error parsing GeoJSON in FitBounds:", e);
        return null;
    }
};

// Componente para ajustar el zoom automáticamente
const FitBounds = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (data && Array.isArray(data) && data.length > 0) {
            try {
                const features = data
                    .map(item => item.geo_dis_json || item.geo_pro_json || item.geo_dep_json)
                    .filter(Boolean)
                    .map(g => safeParseJSON(g))
                    .filter(Boolean); // Filtrar nulos si falló el parse

                if (features.length > 0) {
                    const group = L.featureGroup(features.map(f => L.geoJSON(f)));
                    const bounds = group.getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                }
            } catch (e) {
                console.warn("Error calculating bounds:", e);
            }
        }
    }, [data, map]);

    return null;
};

const MapTerritorio = ({ onOpenContact }) => {
    const [rawData, setRawData] = useState([]);
    const [peruBoundary, setPeruBoundary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTerritorio = async () => {
            try {
                // Fetch territory data
                const response = await fetch('/api/mantenimiento/siam/territorio');
                if (!response.ok) throw new Error('Error al cargar datos del territorio');
                const data = await response.json();
                setRawData(Array.isArray(data) ? data : []);

                // Fetch Peru Boundary
                const boundaryRes = await fetch('/api/mantenimiento/siam/peru-boundary');
                if (boundaryRes.ok) {
                    const boundaryData = await boundaryRes.json();
                    setPeruBoundary(boundaryData);
                }
            } catch (err) {
                console.error("Error fetching map data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTerritorio();
    }, []);

    // Helper para parsear JSON de forma segura (redefinido en scope del componente)
    const safeParseJSONLocal = (str) => {
        try {
            if (typeof str === 'object' && str !== null) return str;
            return JSON.parse(str);
        } catch (e) {
            console.error("Error parsing GeoJSON in useMemo:", e, str);
            return null;
        }
    };

    const { departamentos, provincias, distritos } = useMemo(() => {
        try {
            const depsMap = new Map();
            const provsMap = new Map();
            const distsList = [];

            if (!Array.isArray(rawData)) {
                console.warn("rawData is not an array in useMemo");
                return { departamentos: [], provincias: [], distritos: [] };
            }

            rawData.forEach(item => {
                // Departamentos
                if (item.geo_dep_json && !depsMap.has(item.geo_dep_json)) {
                    const geo = safeParseJSONLocal(item.geo_dep_json);
                    if (geo) {
                        depsMap.set(item.geo_dep_json, {
                            geo,
                            props: {
                                nombre: item.des_dep || 'Departamento',
                                codigo: item.cod_ubi?.substring(0, 2),
                                tipo: 'Departamento'
                            }
                        });
                    }
                }

                // Provincias
                if (item.geo_pro_json && !provsMap.has(item.geo_pro_json)) {
                    const geo = safeParseJSONLocal(item.geo_pro_json);
                    if (geo) {
                        provsMap.set(item.geo_pro_json, {
                            geo,
                            props: {
                                nombre: item.des_pro || 'Provincia',
                                codigo: item.cod_ubi?.substring(0, 4),
                                parent: item.des_dep,
                                tipo: 'Provincia'
                            }
                        });
                    }
                }

                // Distritos
                if (item.geo_dis_json) {
                    const geo = safeParseJSONLocal(item.geo_dis_json);
                    if (geo) {
                        distsList.push({
                            geo,
                            props: {
                                nombre: item.nom_distrito || item.des_dis || 'Distrito',
                                codigo: item.cod_ubi || item.cod_dis,
                                parent_dep: item.des_dep,
                                parent_prov: item.des_pro,
                                tipo: 'Distrito',
                                cod_eje: item.cod_eje,
                                nom_eje: item.nom_eje
                            }
                        });
                    }
                }
            });

            return {
                departamentos: Array.from(depsMap.values()),
                provincias: Array.from(provsMap.values()),
                distritos: distsList
            };
        } catch (e) {
            console.error("Critical error processing map data:", e);
            return { departamentos: [], provincias: [], distritos: [] };
        }
    }, [rawData]);


    const peruCenter = [-9.19, -75.0152];
    // Límites para restringir la navegación a Perú
    const maxBounds = [
        [-20.0, -85.0], // Sur-Oeste (con margen)
        [2.0, -66.0]    // Nor-Este (con margen)
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: 'white', fontSize: '1.5rem' }}>Cargando mapa del territorio...<br /><small>(Verifique que el backend esté corriendo)</small></div>;
    if (error) return <div style={{ textAlign: 'center', padding: '5rem', color: 'red', fontSize: '1.5rem', background: 'rgba(255,255,255,0.1)' }}>Error: {error}<br /><small>Intente recargar la página</small></div>;

    return (
        <section className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <div className="map-header-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 className="premium-title" style={{ margin: 0 }}>Territorio SIAMsoft</h2>
                <button
                    onClick={onOpenContact}
                    className="btn-contact-mobile"
                    style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>✉️</span> Contactar
                </button>
            </div>
            <div className="map-container" style={{ flex: 1, position: 'relative' }}>
                <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                    <defs>
                        <pattern id="red-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                            <rect width="8" height="8" fill="#FF9F43" fillOpacity="0.2" />
                            <path d="M0,8 l8,-8" stroke="#dc2626" strokeWidth="2" />
                        </pattern>
                    </defs>
                </svg>
                <MapContainer
                    center={peruCenter}
                    zoom={5}
                    minZoom={5}
                    maxBounds={maxBounds}
                    maxBoundsViscosity={1.0}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitBounds data={rawData} />

                    <CompanyLocationMarker />

                    {/* Límite Nacional de Perú (Efecto de Resalte y Definición) */}
                    {peruBoundary && (
                        <>
                            {/* Brillo/Sombras externas para resaltar la silueta */}
                            <GeoJSON
                                data={peruBoundary}
                                style={{
                                    color: '#3b82f6',
                                    weight: 6,
                                    opacity: 0.3,
                                    fillOpacity: 0.02,
                                    fillColor: '#3b82f6',
                                    interactive: false
                                }}
                            />
                            {/* Línea de frontera principal sólida */}
                            <GeoJSON
                                data={peruBoundary}
                                style={{
                                    color: '#0f172a', /* Slate 900 */
                                    weight: 2.5,
                                    fillOpacity: 0,
                                    interactive: false
                                }}
                            />
                        </>
                    )}

                    <MapSearch departamentos={departamentos} provincias={provincias} distritos={distritos} />

                    <LayersControl position="topright">
                        <LayersControl.Overlay checked name="Departamentos">
                            <LayerGroup>
                                {departamentos.map((d, i) => (
                                    <GeoJSON
                                        key={`dep-${i}`}
                                        data={d.geo}
                                        style={{ color: '#6C5DD3', weight: 1, fillOpacity: 0.05, dashArray: '5, 10' }}
                                        eventHandlers={{
                                            mouseover: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ weight: 3, fillOpacity: 0.2, color: '#5a4cb1' });
                                            },
                                            mouseout: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ color: '#6C5DD3', weight: 1, fillOpacity: 0.05, dashArray: '5, 10' });
                                            }
                                        }}
                                    >
                                        <Tooltip sticky>
                                            <div className="text-sm">
                                                <strong>{d.props.nombre}</strong><br />
                                                Ubigeo: {d.props.codigo}
                                            </div>
                                        </Tooltip>
                                    </GeoJSON>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Provincias">
                            <LayerGroup>
                                {provincias.map((p, i) => (
                                    <GeoJSON
                                        key={`prov-${i}`}
                                        data={p.geo}
                                        style={{ color: '#57CCF2', weight: 2, fillOpacity: 0.2 }}
                                        eventHandlers={{
                                            mouseover: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ weight: 4, fillOpacity: 0.4, color: '#3bbce0' });
                                            },
                                            mouseout: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ color: '#57CCF2', weight: 2, fillOpacity: 0.2 });
                                            }
                                        }}
                                    >
                                        <Tooltip sticky>
                                            <div className="text-sm">
                                                <strong>{p.props.nombre}</strong><br />
                                                Provincia de: {p.props.parent}<br />
                                                Ubigeo: {p.props.codigo}
                                            </div>
                                        </Tooltip>
                                    </GeoJSON>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>

                        <LayersControl.Overlay checked name="Municipalidades con SIAMsoft">
                            <LayerGroup>
                                {distritos.map((d, i) => (
                                    <GeoJSON
                                        key={`dis-${i}`}
                                        data={d.geo}
                                        style={{ color: '#FF9F43', fillColor: 'url(#red-hatch)', weight: 2, fillOpacity: 0.8 }}
                                        eventHandlers={{
                                            mouseover: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ weight: 4, fillOpacity: 1, color: '#e58e3c' });
                                                layer.bringToFront();
                                            },
                                            mouseout: (e) => {
                                                const layer = e.target;
                                                layer.setStyle({ color: '#FF9F43', fillColor: 'url(#red-hatch)', weight: 2, fillOpacity: 0.8 });
                                            }
                                        }}
                                    >
                                        <Tooltip sticky>
                                            <div className="text-sm">
                                                <strong>Territorio SIAMsoft</strong><br />
                                                Municipalidad de {d.props.nombre}<br />
                                                Departamento: {d.props.parent_dep}<br />
                                                Provincia: {d.props.parent_prov}<br />
                                                Ubigeo: {d.props.codigo}
                                            </div>
                                        </Tooltip>
                                        {(d.props.cod_eje || d.props.nom_eje) && (
                                            <Popup>
                                                <div className="text-center font-bold">
                                                    {d.props.cod_eje} - {d.props.nom_eje}
                                                </div>
                                            </Popup>
                                        )}
                                    </GeoJSON>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>
            </div>
        </section>
    );
};

export default MapTerritorio;
