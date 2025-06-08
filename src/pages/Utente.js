// Utente.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Button style reused in navbar
const btnStyle = {
  marginLeft: '10px',
  padding: '8px 16px',
  fontSize: '16px',
  background: '#ffffff22',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  cursor: 'pointer',
};

// Reusable navbar component
const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('numero_utente');
    navigate('/');
  };

  return (
    <header style={{
      background: 'linear-gradient(90deg, #004d99, #007acc)',
      color: 'white',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      <h1 style={{ margin: 0 }}>Página Pessoal</h1>
      <nav>
        <button onClick={() => navigate('/home')} style={btnStyle}>Home</button>
        <button onClick={() => navigate('/utente')} style={btnStyle}>Página Pessoal</button>
        <button onClick={handleLogout} style={btnStyle}>Logout</button>
      </nav>
    </header>
  );
};

// Main component
const Utente = () => {
  const navigate = useNavigate();
  const [utente, setUtente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const numero_utente = localStorage.getItem('numero_utente');
    if (!numero_utente) {
      navigate('/login');
      return;
    }

    const fetchUtente = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/utente/"+{numero_utente}); //alterei isto nem sei bem como
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro ao buscar dados do utente');
        }

        setUtente(data.utente);
      } catch (err) {
        console.error('Erro ao carregar utente:', err);
        alert('Erro ao carregar os dados do utente.');
      } finally {
        setLoading(false);
      }
    };

    fetchUtente();
  }, [navigate]);

  if (loading) return <p style={{ paddingTop: 120, textAlign: 'center' }}>Carregando...</p>;
  if (!utente) return <p style={{ paddingTop: 120, textAlign: 'center' }}>Dados não encontrados</p>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 120, maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h2>Dados do Utente</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: 8, overflow: 'hidden' }}>
          <tbody>
            {Object.entries(utente).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                  {key.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Utente;