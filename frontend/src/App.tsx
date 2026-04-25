import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;