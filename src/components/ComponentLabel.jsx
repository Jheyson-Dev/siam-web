import React from 'react';

const ComponentLabel = ({ name }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'rgba(255, 105, 180, 0.8)', // Hot pink para que destaque
            color: 'white',
            padding: '2px 6px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none', // Para no interferir con clicks
            borderBottomLeftRadius: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {name}
        </div>
    );
};

export default ComponentLabel;
