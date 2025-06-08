import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    numero_utente: '',
    nome: '',
    data_nascimento: '',
    genero: '',
    nif: '',
    telefone: '',
    email: '',
    morada: '',
    codigo_postal: '',
    localidade: '',
    pais: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5001/api/register', formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao registrar');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Registo de Utente</h2>

          <div style={styles.grid}>
            {Object.keys(formData).map((field) => (
              <div key={field} style={styles.inputGroup}>
                <label>{field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</label>
                <input
                  type={field === 'password' ? 'password' : field === 'data_nascimento' ? 'date' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            ))}
          </div>

          <button type="submit" style={styles.button}>Registar</button>
          <Link to="/" style={styles.linkButton}>Voltar ao Login</Link>

          <p style={{ color: 'red', fontSize: 12 }}>{message}</p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  linkButton: {
    marginTop: 10,
    display: 'inline-block',
    textAlign: 'center',
    color: '#2C9682',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
  },
  background: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2C9682, #368CD5)',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px 30px',
    borderRadius: 16,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  input: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2C9682',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 16
  }
};

export default RegisterForm;
