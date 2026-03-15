import { ConfigProvider } from './context/ConfigContext';
import { Login } from './pages/Login';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ConfigProvider>
      <Toaster position="top-right" />
      <Login />
    </ConfigProvider>
  );
}

export default App;