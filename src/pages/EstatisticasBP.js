import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ReferenceArea
} from 'recharts';
import { groupBy, meanBy, sumBy, std } from 'lodash';
import { standardDeviation } from 'simple-statistics';




const EstatisticasBP = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [dados, setDados] = useState([]);
  const [numeroUtente, setNumeroUtente] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('numero_utente');
    navigate('/');
  };

  useEffect(() => {
    const numeroUtenteLocal = localStorage.getItem('numero_utente');
    setNumeroUtente(numeroUtenteLocal);
    if (numeroUtenteLocal) {
      fetch('http://localhost:5001/compositions_backup')
        .then(res => res.json())
        .then(data => {
          setDados(data.filter(item => item.numero_utente === numeroUtenteLocal));
        });
    }
  }, []);

  const getDateTime = (item) => {
    const date = item.raw_data?.["items.0.0.items.6.value.date"];
    const time = item.raw_data?.["items.0.0.items.6.value.time"] || "00:00";
    return `${date} ${time}`;
  };

  const pressureData = dados.map(item => {
    const date = getDateTime(item);
    const systolic = item.form_data?.blood_pressure?.systolic?.value;
    const diastolic = item.form_data?.blood_pressure?.diastolic?.value;
    return {
      date,
      time: new Date(date),
      systolic,
      diastolic,
      position: item.form_data?.blood_pressure?.position?.text,
      method: item.form_data?.blood_pressure?.method?.text,
      location: item.form_data?.blood_pressure?.measurement_location?.text,
      inclination: item.form_data?.blood_pressure?.inclination?.value ?? 0
    };
  }).filter(item => item.systolic && item.diastolic);

  const groupAvg = (arr, key) => {
    const grouped = groupBy(arr, key);
    return Object.keys(grouped).map(k => ({
      name: k,
      count: grouped[k].length,
      systolic: +meanBy(grouped[k], 'systolic').toFixed(1),
      diastolic: +meanBy(grouped[k], 'diastolic').toFixed(1)
    }));
  };

  const avgByPosition = groupAvg(pressureData, 'position');
  const avgByMethod = groupAvg(pressureData, 'method');
  const avgByLocation = groupAvg(pressureData, 'location');

  const avgByInclination = groupAvg(pressureData, 'inclination');

  const categorize = (systolic, diastolic) => {
    if (systolic < 90 || diastolic < 60) return 'Hipotensão';
    if (systolic >= 180 || diastolic >= 120) return 'Crise hipertensiva';
    if (systolic >= 140 || diastolic >= 90) return 'Hipertensão Estágio 2';
    if (systolic >= 130 || diastolic >= 80) return 'Hipertensão Estágio 1';
    if (systolic >= 120 && diastolic < 80) return 'Elevada';
    return 'Normal';
  };

  const distributionByCategory = groupAvg(pressureData.map(d => ({
    ...d,
    category: categorize(d.systolic, d.diastolic)
  })), 'category');

  const avgByDay = groupAvg(pressureData, d => d.time.toISOString().split('T')[0]);

  const avgByHourGroup = groupAvg(pressureData, d => {
    const hour = d.time.getHours();
    if (hour < 12) return 'Manhã';
    if (hour < 18) return 'Tarde';
    return 'Noite';
  });

  const stddev = (arr, key) => {
    const valores = arr.map(o => o[key]);
    const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
    const variancia = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / valores.length;
    return Math.sqrt(variancia);
    };

  const minMax = key => ({
    min: Math.min(...pressureData.map(d => d[key])),
    max: Math.max(...pressureData.map(d => d[key]))
  });

  const colorPalette = ['#2cccff', '#20e3b2', '#30c0fc', '#3adcb4'];

  const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
            <div style={{
                background: "#fff",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8
            }}>
                <strong>{label}</strong>
                <p>Leituras: {data.count}</p>
                <p>Sistólica: {data.systolic} mmHg</p>
                <p>Diastólica: {data.diastolic} mmHg</p>
            </div>
            );
        }
        return null;
        };

    const InclinationTooltip = ({ active, payload }) => {
        if (active && payload?.length) {
            const data = payload[0].payload;
            return (
            <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10, borderRadius: 8 }}>
                <p><strong>{data.name}º</strong></p>
                <p>Média Sistólica: {data.systolic}</p>
                <p>{data.count} medições</p>
            </div>
            );
        }
        return null;
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

      <main style={styles.main}>
        <h2 style={{ marginBottom: 20 }}>Estatísticas de Pressão Arterial</h2>
        <div style={styles.grid}>
          {/* {[{
            title: 'Evolução Sistólica',
            chart: (
              <LineChart data={pressureData} width={300} height={200}>
                <XAxis dataKey="date" hide /><YAxis /><Tooltip /><Line type="monotone" dataKey="systolic" stroke="#2cccff" />
              </LineChart>
            )
          }, {
            title: 'Evolução Diastólica',
            chart: (
              <LineChart data={pressureData} width={300} height={200}>
                <XAxis dataKey="date" hide /><YAxis /><Tooltip /><Line type="monotone" dataKey="diastolic" stroke="#20e3b2" />
              </LineChart>
            )
          },{ */}
          {[{
          title:"Evolução com Categorias OMS",
          chart:(
            <LineChart width={300} height={220} data={pressureData}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[50, 200]} />
                <Tooltip />
                <Legend />
                
                {/* Zonas OMS para Sistólica */}
                <ReferenceArea y1={50} y2={90} strokeOpacity={0.2} fill="#dcedc1" label="Hipotensão" />
                <ReferenceArea y1={90} y2={120} strokeOpacity={0.2} fill="#a8e6cf" label="Normal" />
                <ReferenceArea y1={120} y2={130} strokeOpacity={0.2} fill="#dcedc1" label="Elevada" />
                <ReferenceArea y1={130} y2={140} strokeOpacity={0.2} fill="#ffd3b6" label="Hip. Estágio 1" />
                <ReferenceArea y1={140} y2={180} strokeOpacity={0.2} fill="#ffaaa5" label="Hip. Estágio 2" />
                <ReferenceArea y1={180} y2={200} strokeOpacity={0.2} fill="#ff8b94" label="Crise" />

                {/* Linhas de evolução */}
                <Line type="monotone" dataKey="systolic" stroke="#2cccff" dot={false} name="Sistólica" />
                <Line type="monotone" dataKey="diastolic" stroke="#20e3b2" dot={false} name="Diastólica" />
                </LineChart>
            )
            },
            {
            title: 'Mínimos e Máximos',
            chart: (
              <BarChart data={[{
                name: 'Min/Max',
                systolicMin: minMax('systolic').min,
                systolicMax: minMax('systolic').max,
                diastolicMin: minMax('diastolic').min,
                diastolicMax: minMax('diastolic').max
              }]} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="systolicMin" fill="#87CEEB" /><Bar dataKey="systolicMax" fill="#2cccff" />
                <Bar dataKey="diastolicMin" fill="#baf9ea" /><Bar dataKey="diastolicMax" fill="#20e3b2" />
              </BarChart>
            )
            }, 
            {
            title: 'Média por Período do Dia',
            chart: (
              <BarChart data={avgByHourGroup} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
            },
            {
            title: 'Distribuição por Categorias OMS',
            chart: (
              <BarChart data={distributionByCategory} width={300} height={200}>
                <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" interval={0}/><YAxis /><Tooltip /><Legend />
                <Bar dataKey="count" fill="#2cccff" />
              </BarChart>
            )
          },
            {
            title: 'Média por Posição',
            chart: (
              <BarChart data={avgByPosition} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />}/><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
          }, 
          {
            title: 'Média por Inclinação',
            chart: (
              <PieChart width={300} height={200}>
                <Pie data={avgByInclination} dataKey="systolic" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, systolic }) => `${name}º: ${systolic}`}>
                  {avgByInclination.map((_, i) => <Cell key={i} fill={colorPalette[i % colorPalette.length]} />)}
                </Pie>
                <Tooltip content={<InclinationTooltip />}/>
              </PieChart>
            )
          },
          {
            title: 'Média por Local Medição',
            chart: (
              <BarChart data={avgByLocation} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
          }, {
            title: 'Média Total',
            chart: (
              <BarChart data={[{
                name: 'Total',
                systolic: +meanBy(pressureData, 'systolic').toFixed(1),
                diastolic: +meanBy(pressureData, 'diastolic').toFixed(1),
                count: pressureData.length
              }]} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />}/><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
          },
          {
            title: 'Média por Método',
            chart: (
              <BarChart data={avgByMethod} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
          },   
          {
            title: 'Desvio Padrão (Sistólica / Diastólica)',
            chart: (
              <BarChart data={[{
                name: 'Desvio',
                systolic: +stddev(pressureData, 'systolic').toFixed(1),
                diastolic: +stddev(pressureData, 'diastolic').toFixed(1)
              }]} width={300} height={200}>
                <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="systolic" fill="#2cccff" /><Bar dataKey="diastolic" fill="#20e3b2" />
              </BarChart>
            )
          }].map((g, i) => (
            <Card key={i} title={g.title}>{g.chart}</Card>
          ))}
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, children }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: hover
          ? '0 12px 24px rgba(0, 0, 0, 0.15)'
          : '0 6px 12px rgba(0, 0, 0, 0.05)',
        padding: 20,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <h4>{title}</h4>
      {children}
    </div>
  );
};

const styles = {
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

export default EstatisticasBP;
