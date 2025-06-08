import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UtentePage = () => {
  const [dadosUtente, setDadosUtente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/dadosUtente.json')
      .then(res => res.json())
      .then(setDadosUtente)
      .catch(console.error);
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2C9682, #368CD5)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: 0 }}>Ficha Pessoal do Utente</h1>
        <nav>
          <button onClick={() => alert('Menu')} style={btnStyle}>Menu</button>
          <button onClick={() => alert('Já está na Página Pessoal')} style={btnStyle}>Página Pessoal</button>
          <button onClick={() => alert('Logout')} style={btnStyle}>Logout</button>
          <button onClick={() => navigate('/historico')} style={btnStyle}>Ver Histórico</button>
          <button onClick={() => navigate('/dashboard')} style={btnStyle}>Ver Dashboard</button>
        </nav>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        {dadosUtente ? (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: 20 }}>Dados do Utente</h2>
            <p><b>Nome:</b> {dadosUtente.nome_completo}</p>
            <p><b>Número de Utente:</b> {dadosUtente.numero_utente}</p>
            <p><b>Data de Nascimento:</b> {dadosUtente.data_nascimento}</p>
            <p><b>Sexo:</b> {dadosUtente.sexo}</p>
            <p><b>NIF:</b> {dadosUtente.nif}</p>
            <p><b>Telefone:</b> {dadosUtente.contacto_telefonico}</p>
            <p><b>Email:</b> {dadosUtente.email}</p>
            <p><b>Morada:</b> {dadosUtente.morada.rua}</p>
            <p><b>Código Postal:</b> {dadosUtente.morada.codigo_postal}</p>
            <p><b>Localidade:</b> {dadosUtente.morada.localidade}</p>
          </div>
        ) : (
          <p>A carregar dados...</p>
        )}
      </main>
    </div>
  );
};



const cardStyle = {
  backgroundColor: 'white',
  padding: 30,
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: 600,
  lineHeight: 1.6
};

const btnStyle = {
  backgroundColor: '#ffffff22',
  color: 'white',
  border: '1px solid white',
  borderRadius: 8,
  padding: '8px 12px',
  marginLeft: 10,
  cursor: 'pointer'
};

export default UtentePage;