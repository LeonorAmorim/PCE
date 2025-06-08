const express = require('express');
const router = express.Router();

// Exemplo de rotas
router.get('/', (req, res) => {
  res.send('Bem-vindo à API!');
});

router.get('/historico', (req, res) => {
  res.send('Lista de utilizadores');
});
router.get('/estatisticasBP', (req, res) => {
  res.send('Estatísticas de Pressão Arterial');
});

router.post('/forms', (req, res) => {
//   const { username, password } = req.body;
//   res.send(`Login de ${username}`);
res.send('Isto seria o forms');
});

module.exports = router;
