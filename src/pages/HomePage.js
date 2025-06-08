import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const HomePage = () => {
  const [hovered, setHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('numero_utente');
    navigate('/');
  };

  const [nome, setNomeUtente] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroUtente, setNumeroUtente] = useState('');
  const [genero, setGenero] = useState('');
  const [ultimoRegisto, setUltimoRegisto] = useState(null);
  const [pressureData, setPressureData] = useState([]);
  const [localMedicao, setLocalMedicao] = useState(null);
  const [registoSelecionado, setRegistoSelecionado] = useState(null);



  useEffect(() => {
    const numeroUtente = localStorage.getItem('numero_utente');
    const numeroUtenteLocal = localStorage.getItem('numero_utente');
    


      

    //const numeroUtente = localStorage.getItem('numero_utente');
    if (numeroUtente) {
      fetch(`http://localhost:5001/api/utente/${numeroUtente}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNomeUtente(data.utente.nome);
            setDataNascimento(data.utente.data_nascimento);
            setNumeroUtente(data.utente.numero_utente);
            setGenero(data.utente.genero);
          }
        })
        .catch(err => {
          console.error("Erro ao buscar nome do utente:", err);
        });
      
    fetch('http://localhost:5001/compositions_backup')
      .then(res => res.json())
      .then(data => {
        setDados(data);
        const parseTimestamp = (item, timePath) => {
          const date = item.raw_data?.["items.0.5.items.4.value.date"]; // fallback geral
          const time = item.raw_data?.["items.0.5.items.4.value.time"] || '00:00';
          return new Date(`${date}T${time}`);
        };

        const filtrarUltimo = (campo) => {
          return data
            .filter(item => item.numero_utente === numeroUtenteLocal && item.form_data?.[campo])
            .map(item => ({
              ...item,
              timestamp: new Date(item.form_data[campo]?.measurement_time || item.created_at)
            }))
            .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
        };

        setUltimoRegisto({
          temperatura: filtrarUltimo('body_temperature'),
          oximetria: filtrarUltimo('pulse_oximetry'),
          pressao: filtrarUltimo('blood_pressure'),
          imc: filtrarUltimo('bmi'),
          frequencia: filtrarUltimo('pulse'),
          respiracao: filtrarUltimo('respiration'), 
        });
        
        const pressurePoints = data
          .filter(item => 
            item.numero_utente === numeroUtenteLocal &&
            item.form_data?.blood_pressure?.systolic?.value &&
            item.form_data?.blood_pressure?.diastolic?.value &&
            item.raw_data?.["items.0.0.items.6.value.date"]
          )
          .map(item => {
            const date = item.raw_data["items.0.0.items.6.value.date"];
            const time = item.raw_data["items.0.0.items.6.value.time"] || "00:00";
            return {
              time: `${date} ${time}`,
              systolic: item.form_data.blood_pressure.systolic.value,
              diastolic: item.form_data.blood_pressure.diastolic.value,
            };
          })
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        setPressureData(pressurePoints);
      })
      .catch(console.error);
    }
  }, []);
  

  const ultimo = dados.length > 0 ? dados[dados.length - 1] : null;
  const info = ultimo?.form_data || {};
  // const numeroUtenteLocal = localStorage.getItem('numero_utente');

  const calcularIdade = (dataNascStr) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascStr);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const findMatchingRecordGroup = (dateTime, dados) => {
    const campos = [
      { path: "form_data.blood_pressure", datePath: "items.0.0.items.6.value.date", timePath: "items.0.0.items.6.value.time" },
      { path: "form_data.body_temperature", datePath: "items.0.5.items.4.value.date", timePath: "items.0.5.items.4.value.time" },
      { path: "form_data.pulse_oximetry", datePath: "items.0.2.items.2.value.date", timePath: "items.0.2.items.2.value.time" },
      { path: "form_data.pulse", datePath: "items.0.3.items.6.value.date", timePath: "items.0.3.items.6.value.time" },
      { path: "form_data.respiration", datePath: "items.0.4.items.6.value.date", timePath: "items.0.4.items.6.value.time" },
      { path: "form_data.bmi", datePath: "items.0.1.items.2.value.date", timePath: "items.0.1.items.2.value.time" },
    ];

    const dadosAgrupados = {};

    for (const campo of campos) {
      for (const item of dados) {
        const date = item.raw_data?.[campo.datePath];
        const time = item.raw_data?.[campo.timePath] || "00:00";
        const full = `${date} ${time}`;

        if (full === dateTime) {
          const subPath = campo.path.split('.').reduce((acc, key) => acc?.[key], item);
          if (subPath) {
            const key = campo.path.split('.').pop();  // Ex: 'bmi', 'pulse', etc.
            dadosAgrupados[key] = subPath;
          }
        }
      }
    }

    return dadosAgrupados;
  };



  
  return (
    <div style={styles.container}>
      {/* Sidebar */}
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

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.heading}>Bem-vindo à Home Page,</h2>
            <h1 style={styles.username}>{nome ? `${nome}` : ''}</h1>
            <p><Link to="/forms" style={styles.btnForms}>Realizar novo registo.</Link></p>
          </div>
          <img
            src="/images/anonimo.png"
            alt="avatar"
            style={styles.avatar}
          />
        </header>

        {/* User Info */}
        <section style={styles.userInfo}>
          <div>
            {dataNascimento ? calcularIdade(dataNascimento) : '--'} 
            <span style={styles.label}>Anos</span>
          </div>

          <div>
            {numeroUtente || '--'}
            <span style={styles.label}>Número de Utente</span>
          </div>

          <div>
            {genero || '--'}
            <span style={styles.label}>Género</span>
          </div>
          <div>
            <span style={styles.label}>Dados da última medição:</span>
          </div>
        </section>

        {/* Cards */}
        <section style={styles.cardGrid}>
          <div style={{...styles.fancyCard,...(hoveredCard === 'temp' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('temp')}onMouseLeave={() => setHoveredCard(null)}>
            <div>Temperatura</div>
            <h2>
              {ultimoRegisto?.temperatura?.form_data?.body_temperature?.temperature?.value ?? '--'}°
            </h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.temperatura?.raw_data?.["items.0.5.items.4.value.date"]
                ? `Medida em ${ultimoRegisto.temperatura.raw_data["items.0.5.items.4.value.date"]}` +
                  (ultimoRegisto.temperatura.raw_data["items.0.5.items.4.value.time"]
                    ? ` às ${ultimoRegisto.temperatura.raw_data["items.0.5.items.4.value.time"]}`
                    : '')
                : ''}
            </p>
          </div>
          
          <div style={{...styles.simpleCard,...(hoveredCard === 'oxi' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('oxi')}onMouseLeave={() => setHoveredCard(null)}>
            <div>Oximetria</div>
            <h2>{ultimoRegisto?.oximetria?.form_data?.pulse_oximetry?.spo2 ?? '--'}</h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.oximetria?.raw_data?.["items.0.2.items.2.value.date"]
                ? `Medida em ${ultimoRegisto.oximetria.raw_data["items.0.2.items.2.value.date"]}` +
                  (ultimoRegisto.oximetria.raw_data["items.0.2.items.2.value.time"]
                    ? ` às ${ultimoRegisto.oximetria.raw_data["items.0.2.items.2.value.time"]}`
                    : '')
                : ''}
            </p>
          </div>
          
          <div style={{...styles.fancyCard2,...(hoveredCard === 'freqResp' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('freqResp')}onMouseLeave={() => setHoveredCard(null)}>
            <div>Frequência Respiratória</div>
            <h2>
              {ultimoRegisto?.respiracao?.form_data?.respiration?.rate?.value ?? '--'} {ultimoRegisto?.respiracao?.form_data?.respiration?.rate?.unit ?? ''}
            </h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.respiracao?.raw_data?.["items.0.4.items.6.value.date"]
                ? `Medida em ${ultimoRegisto.respiracao.raw_data["items.0.4.items.6.value.date"]}` +
                  (ultimoRegisto.respiracao.raw_data["items.0.4.items.6.value.time"]
                    ? ` às ${ultimoRegisto.respiracao.raw_data["items.0.4.items.6.value.time"]}`
                    : '')
                : ''}
            </p>
          </div>
          
          {/* <div style={{...styles.fancyCard2,...(hoveredCard === 'pressao' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('pressao')}onMouseLeave={() => setHoveredCard(null)}>
            <div>Pressão Arterial</div>
            <h2>
              {ultimoRegisto?.pressao?.form_data?.blood_pressure?.systolic?.value ?? '--'}/
              {ultimoRegisto?.pressao?.form_data?.blood_pressure?.diastolic?.value ?? '--'}
            </h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.pressao?.raw_data?.["items.0.0.items.6.value.date"]
                ? `Medida em ${ultimoRegisto.pressao.raw_data["items.0.0.items.6.value.date"]}` +
                  (ultimoRegisto.pressao.raw_data["items.0.0.items.6.value.time"]
                    ? ` às ${ultimoRegisto.pressao.raw_data["items.0.0.items.6.value.time"]}`
                    : '')
                : ''}
            </p>
          </div> */}
          {/* Vou querer adicionar frequencia cardiaca */}

          <div style={{...styles.simpleCard,...(hoveredCard === 'imc' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('imc')}onMouseLeave={() => setHoveredCard(null)}>
            <div>IMC</div>
            <h2>{ultimoRegisto?.imc?.form_data?.bmi?.bmi_value?.value ?? '--'}</h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.imc?.raw_data?.["items.0.1.items.2.value.date"]
                ? `Calculado em ${ultimoRegisto.imc.raw_data["items.0.1.items.2.value.date"]}` +
                  (ultimoRegisto.imc.raw_data["items.0.1.items.2.value.time"]
                    ? ` às ${ultimoRegisto.imc.raw_data["items.0.1.items.2.value.time"]}`
                    : '')
                : ''}
            </p>
          </div>

          <div style={{...styles.fancyCard2,...(hoveredCard === 'freq' ? styles.hoveredCard : {})}}onMouseEnter={() => setHoveredCard('freq')}onMouseLeave={() => setHoveredCard(null)}>
            <div>Frequência Cardíaca</div>
            <h2>{ultimoRegisto?.frequencia?.form_data?.pulse?.rate?.value ?? '--'} bpm</h2>
            <p style={{ fontSize: 12, margin: 0 }}>
              {ultimoRegisto?.frequencia?.raw_data?.["items.0.3.items.6.value.date"]
                ? `Registado em ${ultimoRegisto.frequencia.raw_data["items.0.3.items.6.value.date"]}` +
                  (ultimoRegisto.frequencia.raw_data["items.0.3.items.6.value.time"]
                    ? ` às ${ultimoRegisto.frequencia.raw_data["items.0.3.items.6.value.time"]}`
                    : '')
                : ''}
            </p>
          </div>

        </section>

        {/* Pressão Arterial */}
        <section style={styles.graphSection}>
        <h3>Pressão Arterial</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
              data={pressureData}
              onMouseMove={(e) => {
              const ponto = e.activePayload?.[0]?.payload;
              const dateTime = ponto?.time;
              const dadosAgrupados = findMatchingRecordGroup(dateTime, dados);

              if (Object.keys(dadosAgrupados).length > 0) {
                setRegistoSelecionado({ form_data: dadosAgrupados });
                const local = dadosAgrupados?.blood_pressure?.measurement_location?.text?.toLowerCase() ?? null;
                setLocalMedicao(local);
              } else {
                setRegistoSelecionado(null);
                setLocalMedicao(null);
              }

            }}

            onMouseLeave={() => {
              setLocalMedicao(null);
              setRegistoSelecionado(null);
            }}>
            <XAxis dataKey="time" tick={false} />
            <YAxis domain={[60, 160]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#2cccff" name="Sistólica" />
            <Line type="monotone" dataKey="diastolic" stroke="#20e3b2" name="Diastólica" />
          </LineChart>
        </ResponsiveContainer>
      </section>
      </main>

      {/* Right visual - Manequim */}
      <aside style={styles.rightCol}>
        <img
          src="/images/manequim.png"
          alt="Manequim"
          style={styles.manequimImg}
        />
        {registoSelecionado && (
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            background: '#fff',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            width: '220px',
            fontSize: '12px',
            zIndex: 10
          }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Medição Detalhada</strong>
            <div>📏 IMC: {registoSelecionado?.form_data?.bmi?.bmi_value?.value ?? '--'}</div>
            <div>🌡 Temperatura: {registoSelecionado?.form_data?.body_temperature?.temperature?.value ?? '--'}°C</div>
            <div>🫁 Respiração: {registoSelecionado?.form_data?.respiration?.rate?.value ?? '--'} {registoSelecionado.form_data?.respiration?.rate?.unit ?? ''}</div>
            <div>🩸 Oximetria: {registoSelecionado?.form_data?.pulse_oximetry?.spo2 ?? '--'}</div>
            <div>❤️ FC: {registoSelecionado?.form_data?.pulse?.rate?.value ?? '--'} bpm</div>
            <div>💓 PA: {(registoSelecionado?.form_data?.blood_pressure?.systolic?.value ?? '--')}/{(registoSelecionado.form_data?.blood_pressure?.diastolic?.value ?? '--')}</div> {/*Acrescentar  se é sentado ou de pé , acordado ou a dormir e nível de inclinação*/}
          </div>

        )}

        {["coxa direita", "coxa esquerda", "braço direito", "braço esquerdo"].includes(localMedicao) && (
            <>
              {localMedicao === "braço esquerdo" && (
                <div style={{ ...styles.point, top: '34%', left: '32%' }} />
              )}
              {localMedicao === "braço direito" && (
                <div style={{ ...styles.point, top: '34%', left: '64.5%' }} />
              )}
              {localMedicao === "coxa direita" && (
                <div style={{ ...styles.point, top: '60%', left: '55%' }} />
              )}
              {localMedicao === "coxa esquerda" && (
                <div style={{ ...styles.point, top: '60%', left: '40%' }} />
              )}
            </>
          )}

      </aside>
    </div>
  );
};

const styles = {
  hoveredCard: {
  transform: 'scale(1.05)',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  btnForms: {
  marginLeft: '-15px',
  padding: '8px 16px',
  fontSize: '10px',
  background: '#ffffff22',
  border: 'none',
  borderRadius: '4px',
  color: 'blue',
  cursor: 'pointer'
  },
  menuList: {
  listStyle: 'none',
  padding: 0,
  color: '#fff',
  fontSize: 16
  },
  btnStyle: {
    marginLeft: '10px',
    padding: '4px 8px',
    fontSize: '12px',
    background: '#ffffff22',
    border: 'none',
    borderRadius: '2px',
    color: 'white',
    cursor: 'pointer',
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: '#f7fafd',
  },
  sidebar: {
    width: 40,
    background: '#fff',
    borderRight: '1px solid #eee',
    //display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
    gap: 20,
    background: 'linear-gradient(135deg, #2C9682, #368CD5)',
    backgroundColor: '#2C9682', // fallback
    color: '#fff',
    overflow: 'hidden',
    transition: 'width 0.3s ease',
    whiteSpace: 'nowrap',
    //height: '100vh',
    alignSelf: 'stretch',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  navItem: {
    fontSize: 20,
    cursor: 'pointer',
  },
  main: {
    flex: 2,
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: { margin: 0, fontWeight: 400 },
  username: { margin: 0 , fontSize: 20},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  userInfo: {
    display: 'flex',
    gap: 40,
    fontSize: 18,
    color: '#333'
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4
  },
  cardGrid: {
    display: 'flex',
    gap: 20,
  },
  fancyCard: {
    background: 'linear-gradient(135deg, #20e3b2, #2cccff)',
    borderRadius: '20px',
    color: 'white',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '180px',
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px'
  },
  fancyCard2: {
    background: 'linear-gradient(135deg, #20e3b2, #2cccff)',
    borderRadius: '20px',
    color: 'white',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '180px',
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '19px'
  },
  simpleCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    width: '180px',
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px'
  },
  graphSection: {
    marginTop: 20
  },
  heartRateGraph: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightCol: {
    flex: 1,
    //background: '#eaf8ff',
    background: '#f7fafd',
    //borderLeft: '1px solid #ddd',
    borderLeft: 'none',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  manequimImg: {
    maxHeight: '90%',
    objectFit: 'contain',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    background: 'transparent',
    borderRadius: 0,
  },
  floatingBox: {
    position: 'absolute',
    top: '30%',
    right: '10%',
    background: '#fff',
    padding: '16px 20px',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    fontSize: 16,
    textAlign: 'center'
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#00c2ff',
    borderRadius: '50%',
    boxShadow: '0 0 8px #00c2ff'
  }
};

export default HomePage;
