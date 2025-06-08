// import React, { useEffect, useState } from 'react';

// const DashboardPage = () => {
//   const [dados, setDados] = useState([]);

//   useEffect(() => {
//     fetch('http://localhost:5001/compositions_backup')
//       .then(res => res.json())
//       .then(data => setDados(data))
//       .catch(console.error);
//   }, []);

//   const ultimo = dados.length > 0 ? dados[dados.length - 1] : null;
//   const info = ultimo?.form_data || {};

//   return (
//     <div style={containerStyle}>
//       {/* Sidebar */}
//       <aside style={sidebarStyle}>
//         <h2 style={{ color: '#fff' }}>Painel</h2>
//         <nav>
//           <ul style={{ listStyle: 'none', padding: 0, color: '#fff' }}>
//             <li>Dashboard</li>
//             <li>Histórico</li>
//             <li>Utente</li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Conteúdo principal */}
//       <main style={mainStyle}>
//         <h1>Dashboard Clínica</h1>

//         {ultimo ? (
//           <>
//             {/* Cards de medições recentes */}
//             <div style={cardRowStyle}>
//               <Card title="Temperatura" value={`${info.body_temperature?.temperature?.value ?? 'N/A'} °C`} />
//               <Card title="Pressão Arterial" value={`${info.blood_pressure?.position?.text ?? 'N/A'}`} />
//               <Card title="IMC" value={`${info.bmi?.value ?? 'N/A'} ${info.bmi?.unit ?? ''}`} />
//               <Card title="Saturação" value={`${info.pulse_oximetry?.sensor_location ?? 'N/A'}`} />
//             </div>

//             {/* Gráfico ou Info + Manequim */}
//             <div style={bottomSectionStyle}>
//               <div style={graphPlaceholderStyle}>
//                 <h3>Frequência Cardíaca</h3>
//                 <p>92 bpm médio</p>
//                 {/* aqui poderás colocar gráfico real com chart.js ou recharts */}
//               </div>

//               <div style={{ position: 'relative', width: 250 }}>
//                 <img
//                   src={getImagemPorPosicao(info.blood_pressure?.position?.text)}
//                   alt="manequim"
//                   style={{ width: '100%' }}
//                 />
//                 {renderPonto(info.blood_pressure?.measurement_location?.text)}
//               </div>
//             </div>
//           </>
//         ) : (
//           <p>A carregar dados...</p>
//         )}
//       </main>
//     </div>
//   );
// };

// // Card reutilizável
// const Card = ({ title, value }) => (
//   <div style={cardStyle}>
//     <h3>{title}</h3>
//     <p style={{ fontSize: '1.5em', margin: 0 }}>{value}</p>
//   </div>
// );

// // Estilos base
// const containerStyle = {
//   display: 'flex',
//   minHeight: '100vh',
//   fontFamily: 'Arial, sans-serif',
//   background: '#f0f4f8'
// };

// const sidebarStyle = {
//   width: 200,
//   background: 'linear-gradient(135deg, #2C9682, #368CD5)',
//   padding: 20
// };

// const mainStyle = {
//   flex: 1,
//   padding: 40,
//   display: 'flex',
//   flexDirection: 'column'
// };

// const cardRowStyle = {
//   display: 'flex',
//   gap: 20,
//   marginBottom: 40
// };

// const cardStyle = {
//   background: 'white',
//   borderRadius: 16,
//   padding: 20,
//   minWidth: 180,
//   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//   flex: 1
// };

// const bottomSectionStyle = {
//   display: 'flex',
//   gap: 40,
//   alignItems: 'center'
// };

// const graphPlaceholderStyle = {
//   background: 'white',
//   padding: 20,
//   borderRadius: 16,
//   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//   flex: 1
// };

// // Escolhe imagem baseada na posição do utente
// const getImagemPorPosicao = (texto = '') => {
//   const desc = texto?.toLowerCase() || '';
//   if (desc.includes('sentado')) return '/images/manequimsentado.png';
//   if (desc.includes('deitado')) return '/images/manequimdeitado.png';
//   return '/images/manequim.png'; // default em pé
// };

// // Posiciona ponto com base na medição
// const renderPonto = (posicao) => {
//   const styleBase = {
//     position: 'absolute',
//     width: 12,
//     height: 12,
//     backgroundColor: '#00c2ff',
//     borderRadius: '50%',
//     boxShadow: '0 0 8px #00c2ff'
//   };

//   switch (posicao?.toLowerCase()) {
//     case 'braço direito':
//       return <div style={{ ...styleBase, top: '35%', left: '70%' }} />;
//     case 'braço esquerdo':
//       return <div style={{ ...styleBase, top: '35%', left: '20%' }} />;
//     case 'coxa direita':
//       return <div style={{ ...styleBase, top: '80%', left: '60%' }} />;
//     case 'coxa esquerda':
//       return <div style={{ ...styleBase, top: '60%', left: '50%' }} />;
//     default:
//       return null;
//   }
// };

// export default DashboardPage;

import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/compositions_backup')
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(console.error);
  }, []);

  const ultimo = dados.length > 0 ? dados[dados.length - 1] : null;
  const info = ultimo?.form_data || {};

  return (
    <div style={container}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <h2 style={{ color: '#fff' }}>Painel</h2>
        <ul style={menuList}>
          <li>Dashboard</li>
          <li>Histórico</li>
          <li>Utente</li>
          <li>Estatísticas</li>
        </ul>
      </aside>

      {/* Conteúdo principal */}
      <main style={main}>
        <header style={header}>
          <h1 style={{ margin: 0 }}>Dashboard Clínica</h1>
          {/* Aqui poderás colocar nome do paciente e avatar */}
        </header>

        {/* Secção de cards */}
        Última Medição:
        <section style={cardSection}>
          <Card title="Temperatura" value={`${info?.body_temperature?.measurement_location_comment?? 'N/A'} ºC`} />
          <Card title="Pressão Arterial" value={info?.blood_pressure?.position?.text ?? 'N/A'} />
          <Card title="IMC" value={`${info?.bmi?.value ?? 'N/A'} kg/m²`} />
          <Card title="Saturação" value={info?.pulse_oximetry?.sensor_location ?? 'N/A'} />
        </section>

        {/* Secção gráfica + manequim */}
        <section style={bodySection}>
          <div style={graphBox}>
            <h3>Frequência Cardíaca</h3>
            <p>{info?.pulse?.body_location_comment ?? 'N/A'} bpm médio</p>
            {/* gráfico real pode vir aqui */}
          </div>

          <div style={{ position: 'relative', width: 250 }}>
            <img
              src={getImagemPorPosicao(info?.blood_pressure?.position?.text)}
              alt="manequim"
              style={{ width: '100%' }}
            />
            {renderPonto(info?.blood_pressure?.measurement_location?.text)}
          </div>
        </section>
      </main>
    </div>
  );
};

// Componente reutilizável de card
const Card = ({ title, value }) => (
  <div style={card}>
    <strong>{title}</strong>
    <p style={{ fontSize: '1.4em', margin: 0 }}>{value}</p>
  </div>
);

// Estilos
const container = {
  display: 'flex',
  fontFamily: 'Arial, sans-serif',
  background: '#f0f4f8',
  minHeight: '100vh'
};

const sidebar = {
  width: 200,
  background: 'linear-gradient(135deg, #2C9682, #368CD5)',
  padding: 20
};

const menuList = {
  listStyle: 'none',
  padding: 0,
  color: '#fff',
  fontSize: 16
};

const main = {
  flex: 1,
  padding: 40,
  display: 'flex',
  flexDirection: 'column'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const cardSection = {
  display: 'flex',
  gap: 20,
  marginTop: 30,
  marginBottom: 30
};

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  flex: 1
};

const bodySection = {
  display: 'flex',
  gap: 40,
  alignItems: 'center'
};

const graphBox = {
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  flex: 1
};

// Alterna imagem por posição
const getImagemPorPosicao = (texto = '') => {
  const t = texto?.toLowerCase() || '';
  if (t.includes('sentado')) return '/images/manequim_sentado.png';
  if (t.includes('deitado')) return '/images/manequim_deitado.png';
  return '/images/manequim.png';
};

// Renderiza ponto no corpo
const renderPonto = (posicao) => {
  const base = {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#00c2ff',
    borderRadius: '50%',
    boxShadow: '0 0 8px #00c2ff'
  };

  switch (posicao?.toLowerCase()) {
    case 'braço direito':
      return <div style={{ ...base, top: '35%', left: '70%' }} />;
    case 'braço esquerdo':
      return <div style={{ ...base, top: '35%', left: '20%' }} />;
    case 'perna direita':
      return <div style={{ ...base, top: '80%', left: '60%' }} />;
    case 'perna esquerda':
      return <div style={{ ...base, top: '80%', left: '30%' }} />;
    default:
      return null;
  }
};

export default DashboardPage;

