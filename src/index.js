import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import ItemDetail from './components/ItemDetail'; 
import StarterPage from './components/StarterPage'; 
import { ToastContainer } from 'react-toastify';
import './index.css';
import AdminPanel from './components/admin/AdminPanel';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import ProtectedRoute from './components/ProtectedRoute';

const Root = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ToastContainer
        theme='dark'
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover={true}
      />
      <Router>
        <Routes>
          <Route path="/" element={<StarterPage />} />
          <Route path="/:society" element={<App />} />
          <Route path="/item/:itemName" element={<ItemDetail />} />
          <Route path="/:society/admin" element={<ProtectedRoute adminRequired><AdminPanel /></ProtectedRoute>}/>
        </Routes>
      </Router>
    </PersistGate>
  </Provider>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Root />);