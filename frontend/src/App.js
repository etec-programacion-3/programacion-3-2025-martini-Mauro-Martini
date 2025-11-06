import React, { useState, useEffect } from 'react';
import { getJuegos, getImageUrl } from './api';
import { Link, Route, Routes } from 'react-router-dom';
import Juego from './Juego';
import Auth from './Auth';
import Navbar from './Navbar';
import './App.css';

function ListaDeJuegos() {
  const [juegos, setJuegos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJuegos() {
      setError(null);
      setLoading(true);
      try {
        const juegosData = await getJuegos();
        setJuegos(juegosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJuegos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Lista de Juegos</h1>
      {loading && <p>Cargando juegos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {juegos.map((juego) => (
          <div key={juego.id} className="juego-card">
            {juego.rutaImagen && (
              <img 
                src={getImageUrl(juego.rutaImagen)} 
                alt={juego.titulo}
                className="juego-imagen"
              />
            )}
            <Link to={`/juegos/${juego.id}`}>
              <h2>{juego.titulo}</h2>
            </Link>
            <p>Promedio de Calidad: {juego.avgCalidad || 'N/A'}</p>
            <p>Promedio de Dificultad: {juego.avgDificultad || 'N/A'}</p>
            <p style={{ fontStyle: 'italic' }}>Autor: {juego.User.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ListaDeJuegos />} />
        <Route path="/juegos/:id" element={<Juego />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
}