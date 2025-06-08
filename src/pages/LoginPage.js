import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    numero_utente: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/login', credentials);
      if (res.data.success) {
        setMessage('Login realizado com sucesso!');
        localStorage.setItem('numero_utente', res.data.numero_utente);
        if (onLogin) onLogin(res.data.numero_utente);
        navigate('/home');
      } else {
        setMessage('Credenciais inválidas');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro no login');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Login</h2>
          <div style={styles.inputGroup}>
            <label>Número de Utente:</label>
            <input
              name="numero_utente"
              type="text"
              value={credentials.numero_utente}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Senha:</label>
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Entrar</button>
          <p style={{ color: 'red', fontSize: 12 }}>{message}</p>
          <p style={{ fontSize: 14 }}>
            Não tem conta? <Link to="/register">Registe-se aqui</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  background: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #2C9682, #368CD5)',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: 16,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: 400,
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
    backgroundColor: '#2C9682',
    color: 'white',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default LoginForm;
