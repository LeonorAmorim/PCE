///este código quando for para ver o dashboard a funcionar
// import React from 'react';
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import UtentePage from './pages/UtentePage';
// import HistoricoPage from './pages/HistoricoPage';
// import DashboardPage from './pages/DashboardPage';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path = "/utente" element={<UtentePage />} />
//         <Route path="/historico" element={<HistoricoPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
///fim do código para ver o dahboard a funcionar

//código para o formulário funcionar:
// import React from 'react';
// import { Form } from 'protected-aidaforms';
// import jdt from './jdt_monit.json';
// import formDesign from './style-monit.json';

// const saveComposition = async (values) => {
//   try {
//     console.log('Dados a enviar:', values);
    
//     const response = await fetch('http://localhost:5001/api/compositions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ composition: values }),
//     });

//     const result = await response.json();
    
//     if (!response.ok) {
//       const error = new Error(result.error || 'Erro ao guardar dados');
//       error.response = result;
//       throw error;
//     }

//     console.log('Dados guardados com sucesso:', result);
//     return result;

//   } catch (err) {
//     console.error('Erro detalhado:', err);
//     alert(`Erro ao salvar: ${err.message}`);
//     throw err;
//   }
// };

// const App = () => {
//   return (
//     <div style={{ padding: 20 }}>
//       <Form
//         template={jdt.jdt}
//         formDesign={{formDesign}}
//         showPrint={false}
//         editMode={true}
//         submitButtonDisabled={false}
//         canSubmit={true}
//         onSubmit={(values) => saveComposition(values)}
//         saveButtonDisabled={false}
//         canSave={false}
//         canCancel={true}
//         dlm={{}}
//         professionalTasks={['Registar Pedido', 'Consultar Pedido', 'Anular Pedido']}
//       />
//     </div>
//   );
// };

// export default App;
// fim do código para o forms funcionar


//versão Poker
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Forms from './pages/Forms';
import Utente from './pages/Utente';
import LoginPage from './pages/LoginPage'; // ✅ Using the updated login page
import RegisterForm from './pages/RegisterForm';
import HomePage from './pages/HomePage'; // ✅ Import HomePage
import EstatisticasBP from './pages/EstatisticasBP';

function App() {
  const [numeroUtente, setNumeroUtente] = useState(null);

  const PrivateRoute = ({ element }) => {
    return numeroUtente ? element : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={setNumeroUtente} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
        <Route path="/forms" element={<PrivateRoute element={<Forms />} />} />
        <Route path="/utente" element={<PrivateRoute element={<Utente />} />} />
        <Route path="/estatisticasBP" element={<PrivateRoute element={<EstatisticasBP />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//fim versão da Poker