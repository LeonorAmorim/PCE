import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

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
      setMessage(res.data.message);
      if (onLogin) onLogin(res.data.numero_utente);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro no login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div>
        <label>Email:</label>
        <input name="email" type="email" value={credentials.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Senha:</label>
        <input name="password" type="password" value={credentials.password} onChange={handleChange} required />
      </div>
      <button type="submit">Entrar</button>
      <p>{message}</p>
      <p>Não tem conta? <Link to="/register">Registe-se aqui</Link></p>
    </form>
  );
};

export default LoginForm;