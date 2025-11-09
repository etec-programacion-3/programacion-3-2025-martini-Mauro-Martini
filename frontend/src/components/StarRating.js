import React, { useState } from 'react';
import Estrella from './Estrella';

export default function StarRating({ value, onChange, label }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ 
        display: 'block', 
        marginBottom: 12, 
        fontWeight: '600',
        fontSize: '16px',
        color: 'white' // Label en Blanco
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                transition: 'transform 0.2s',
                transform: hover === star ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <Estrella filled={star <= (hover || value)} size={32} />
            </button>
          ))}
        </div>
        {value > 0 && (
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: 'white', // Puntaje en Blanco
            marginLeft: 8
          }}>
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}