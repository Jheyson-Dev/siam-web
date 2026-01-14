import React, { useState, useMemo } from 'react';
import { useMap, GeoJSON, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import ComponentLabel from './ComponentLabel';

const MapSearch = ({ departamentos = [], provincias = [], distritos = [] }) => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Función para normalizar texto: minusculas, sin tildes, trim
    const normalizeText = (text) => {
        return text
            ? text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
            : '';
    };

    const allData = useMemo(() => {
        const d = departamentos.map(x => ({ ...x, type: 'Departamento', searchStr: normalizeText(`${x.props.nombre} ${x.props.codigo}`) }));
        const p = provincias.map(x => ({ ...x, type: 'Provincia', searchStr: normalizeText(`${x.props.nombre} ${x.props.codigo}`) }));
        const di = distritos.map(x => ({ ...x, type: 'Distrito', searchStr: normalizeText(`${x.props.nombre} ${x.props.codigo}`) }));
        return [...d, ...p, ...di];
    }, [departamentos, provincias, distritos]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedItem(null);

        if (val.length < 2) {
            setResults([]);
            return;
        }

        const normalizedVal = normalizeText(val);
        // Filtrar y limitar a 10 resultados para rendimiento
        const filtered = allData
            .filter(item => item.searchStr.includes(normalizedVal))
            .slice(0, 10);

        setResults(filtered);
    };

    const handleSelect = (item) => {
        setQuery(item.props.nombre);
        setResults([]);
        setSelectedItem(item);

        if (item.geo) {
            const layer = L.geoJSON(item.geo);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
        }
    };

    const handleFocus = (e) => {
        e.target.select(); // Selecciona todo el texto para facilitar reescritura
        // O si prefieres que se borre totalmente: setQuery('');
    };

    return (
        <>
            {selectedItem && (
                <GeoJSON
                    key={`selected-${selectedItem.props.codigo}`}
                    data={selectedItem.geo}
                    style={{ color: '#000', weight: 4, fillOpacity: 0.1, dashArray: '10, 5' }}
                >
                    <Tooltip permanent direction="center" className="custom-tooltip">
                        <div style={{ textAlign: 'center' }}>
                            <strong style={{ fontSize: '1.2em' }}>{selectedItem.props.nombre}</strong><br />
                            <span style={{ fontSize: '0.9em', color: '#555' }}>
                                {selectedItem.type}<br />
                                {selectedItem.props.codigo}
                            </span>
                        </div>
                    </Tooltip>
                </GeoJSON>
            )}
            <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'auto', marginTop: '10px', marginLeft: '60px', zIndex: 1000 }}>
                <div className="leaflet-control" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
                    <ComponentLabel name="MapSearch" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        onFocus={handleFocus}
                        placeholder="Buscar Departamento, provincia, distrito o Ubigeo..."
                        className="map-search-input"
                    />
                    {results.length > 0 && (
                        <ul style={{
                            listStyle: 'none',
                            margin: '5px 0 0 0',
                            padding: 0,
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            width: '280px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {results.map((res, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleSelect(res)}
                                    style={{
                                        padding: '10px 15px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        transition: 'background-color 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{res.props.nombre}</span>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <span style={{ textTransform: 'capitalize' }}>{res.type.toLowerCase()}</span>
                                        <span style={{ fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: '0 4px', borderRadius: '3px' }}>{res.props.codigo}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default MapSearch;
