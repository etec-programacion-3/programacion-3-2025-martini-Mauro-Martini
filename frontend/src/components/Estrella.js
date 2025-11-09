import React from 'react';

export default function Estrella({ filled, half, size = 24, color = '#fbbf24' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'inline-block' }}
    >
      {half ? (
        <>
          <defs>
            <linearGradient id={`half-star-${size}-${color.replace('#', '')}`}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#half-star-${size}-${color.replace('#', '')})`}
            stroke={color}
            strokeWidth="1"
          />
        </>
      ) : (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled ? color : '#e5e7eb'}
          stroke={color}
          strokeWidth="1"
        />
      )}
    </svg>
  );
}