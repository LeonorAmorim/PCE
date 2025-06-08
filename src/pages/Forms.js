import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'protected-aidaforms';
import rawJdt from './../jdt_monit.json';
import formDesign from './../style-monit.json';

// Wrap rawJdt as expected by Form component
const jdt = { jdt: rawJdt };

const btnStyle = {
  backgroundColor: '#ffffff22',
  color: 'white',
  border: '1px solid white',
  borderRadius: 8,
  padding: '8px 12px',
  marginLeft: 10,
  cursor: 'pointer',
};

const Navbar = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [numeroUtente, setNumeroUtente] = useState('');
  const handleLogout = () => {
    localStorage.removeItem('numero_utente');
    navigate('/');
  };
  return (
    <div style={styles.container}>
      <aside
        style={{
          ...styles.sidebar,
          width: hovered ? '200px' : '60px',
          padding: hovered ? '20px' : '20px 10px'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <h2 style={{ color: '#fff' }}>{hovered ? 'Painel' : ' '}</h2>
        <ul style={styles.menuList}>
          <li>
            <button onClick={() => navigate('/home')} style={styles.btnStyle}>
              {hovered ? 'Home' : '🏠︎'}
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/utente')} style={styles.btnStyle}>
              {hovered ? 'Página Pessoal' : <img src="/images/emojiAnonimo.png" alt="User" style={{ width: 45.5, height: 15 }} />}
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/utente')} style={styles.btnStyle}>
              {hovered ? 'Histórico' : <span style={{ fontSize: '9.5px' }}>📄</span>}
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/estatisticasBP')} style={styles.btnStyle}>
              {hovered ? 'Estatísticas' : <span style={{ fontSize: '9.5px' }}>📊</span>}
            </button>
          </li>
          <li>
            <button onClick={handleLogout} style={styles.btnStyle}>
              {hovered ? 'Logout' : '🖥'}
            </button>
          </li>
        </ul>
      </aside>
    </div>
  );
};

const saveComposition = async (values) => {
  try {
    const numero_utente = localStorage.getItem('numero_utente');
    if (!numero_utente) throw new Error('Número de utente não encontrado.');

    const payload = {
      composition: values,
      numero_utente,
    };

    console.log('Enviando dados:', payload);
    const raw = values.toJS ? values.toJS() : values;
    console.log("Dados que vão ser enviados ao backend:", raw);

    const response = await fetch('http://localhost:5001/api/compositions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao guardar dados');
    }

    const result = await response.json();
    alert('Formulário enviado com sucesso!');
    return result;
  } catch (err) {
    console.error('Erro ao salvar:', err);
    alert(`Erro ao salvar: ${err.message}`);
    throw err;
  }
};

const sendBundleToMirth = async () => {
  try {
    // 1. Get the latest FHIR bundle from your backend
    const bundleRes = await fetch('http://localhost:5001/api/fhir-bundle/latest');
    if (!bundleRes.ok) {
      throw new Error(`Failed to fetch bundle: ${bundleRes.status} ${bundleRes.statusText}`);
    }

    const bundle = await bundleRes.json();
    console.log('FHIR Bundle to send:', bundle);

    // 2. Send to Mirth Connect
    const mirthRes = await fetch('http://localhost:8095/fhir-bundle/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bundle),
    });

    // 3. Handle Mirth response
    if (!mirthRes.ok) {
      let errorMessage = 'Mirth Connect error';
      try {
        const errorData = await mirthRes.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorMessage = await mirthRes.text();
      }
      throw new Error(errorMessage);
    }

    // Success case
    const result = await mirthRes.json().catch(() => ({ success: true }));
    console.log('Mirth Connect response:', result);
    alert('Bundle enviado com sucesso para Mirth Connect!');
    return result;
  } catch (error) {
    console.error('Erro no envio para Mirth:', {
      error: error.message,
      stack: error.stack,
    });
    alert(`Falha no envio para Mirth: ${error.message}`);
    throw error;
  }
};

const Forms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const numero_utente = localStorage.getItem('numero_utente');
    if (!numero_utente) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.formContent}>
        <div style={{ maxWidth: 900, width: '100%' }}>
        <Form
          template={jdt.jdt}
          formDesign={formDesign}
          showPrint={false}
          editMode={true}
          submitButtonDisabled={false}
          canSubmit={true}
          onSubmit={saveComposition}
          saveButtonDisabled={false}
          canSave={false}
          canCancel={true}
          dlm={{}}
          professionalTasks={['Registar Pedido', 'Consultar Pedido', 'Anular Pedido']}
        />
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={sendBundleToMirth}
            style={{
              ...btnStyle,
              backgroundColor: '#007acc',
              border: 'none',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '16px',
              margin: '10px 0',
            }}
          >
            Enviar Bundle para Mirth Connect
          </button>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Clique para enviar os dados para o sistema Mirth Connect
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  formContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',     // Horizontalmente ao centro
    alignItems: 'flex-start',     // Ou 'center' para também centrar verticalmente
    padding: '40px 20px',
    background: '#f7fafd',        // Igual ao fundo
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: '#f7fafd'
  },
  sidebar: {
    width: 40,
    background: '#fff',
    borderRight: '1px solid #eee',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    gap: 20,
    background: 'linear-gradient(135deg, #2C9682, #368CD5)',
    backgroundColor: '#2C9682',
    color: '#fff',
    overflow: 'hidden',
    transition: 'width 0.3s ease',
    whiteSpace: 'nowrap',
    //height: '100vh',
    alignSelf: 'stretch',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    color: '#fff'
  },
  btnStyle: {
    marginLeft: '10px',
    padding: '4px 8px',
    fontSize: '12px',
    background: '#ffffff22',
    border: 'none',
    borderRadius: '2px',
    color: 'white',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: 40
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20
  }
};

export default Forms;