import { ConfigProvider } from './context/ConfigContext';
import { Login } from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ConfigProvider>
      <Toaster position="top-right" />
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;