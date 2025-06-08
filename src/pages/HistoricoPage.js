import React, { useState, useEffect } from 'react';

const HistoricoPage = () => {
  const [registos, setRegistos] = useState([]);
  const [filtroData, setFiltroData] = useState('');

  // useEffect(() => {
  //   fetch('http://localhost:5001/compositions_backup.json')
  //     .then(res => res.json())
  //     .then(setRegistos)
  //     .catch(console.error);
  // }, []);
  useEffect(() => {
  fetch('http://localhost:5001/compositions_backup')
    .then(res => res.json())
    .then(data => {
      console.log("Dados recebidos:", data);  // 👈 Adicionado
      setRegistos(data);
    })
    .catch(console.error);  
  }, []);


  // Filtra por data no formato YYYY-MM-DD
  // const registosFiltrados = filtroData
  // ? registos.filter(r => {
  //     const dataFormatada = new Date(r.created_at).toISOString().slice(0, 10);
  //     return dataFormatada === filtroData;
  //   })
  // : registos;
  // const registosFiltrados = registos.filter((r) => {
  // const dataFormatada = new Date(r.created_at).toISOString().split('T')[0]; // Garantido: "2025-05-22"
  // console.log("Comparar:", dataFormatada, filtroData); // DEBUG
  // return dataFormatada === filtroData;
  // });
  const registosFiltrados = filtroData
  ? registos.filter((r) => {
      const dataFormatada = new Date(r.created_at).toISOString().split('T')[0];
      return dataFormatada === filtroData;
    })
  : registos;



  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '100vh' }}>
      <header style={{
        background: 'linear-gradient(135deg, #2C9682, #368CD5)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
      <h1 style={{ margin: 0 }}>Histórico Clínico</h1>
      
      <nav>
        <button onClick={() => alert('Voltar')} style={btnStyle}>Voltar</button>
      </nav>
      </header>

      <main style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="date"
          value={filtroData}
          // onChange={(e) => setFiltroData(e.target.value)}
          onChange={(e) => {
            console.log("Data selecionada:", e.target.value); // 👈 DEBUG
            setFiltroData(e.target.value);
          }}
          style={inputStyle}
        />

        <div style={cardStyle}>
          <h2>Registos Encontrados</h2>
          {registosFiltrados.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {registosFiltrados.map((r, i) => (
                <li key={i} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
                  <strong>Data:</strong> {r.created_at.slice(0, 10)}<br />
                  <strong>Pressão arterial (posição):</strong> {r.form_data?.blood_pressure?.position?.text}<br />
                  <strong>IMC:</strong> {r.form_data?.bmi?.value} {r.form_data?.bmi?.unit}
                </li>
              ))}
            </ul>
          ) : (
            <p>Sem registos para esta data.</p>
          )}
        </div>
      </main>
    </div>
  );
};

// Estilos
const headerStyle = {
  background: 'linear-gradient(135deg, #2C9682, #368CD5)',
  color: 'white',
  padding: '20px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
};

const cardStyle = {
  backgroundColor: 'white',
  padding: 30,
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: 600,
  marginTop: 30
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

const inputStyle = {
  padding: '10px 15px',
  borderRadius: 8,
  border: '1px solid #ccc',
  marginBottom: 20
};

export default HistoricoPage;
