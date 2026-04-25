import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

export const Login: React.FC = () => {
  const { logoUrl, primaryColor } = useConfig();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos!');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/login', { email, password });
      
      localStorage.setItem('@AgendaToken', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Esquerda: Imagem do Produto */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center">
        <img 
          src="/src/assets/login-product.png"
          alt="Produto" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Direita: Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Empresa" className="h-20 mb-6" />
            ) : (
              <div className="h-20 w-20 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
                <span className="text-xs text-gray-400">Sua Logo</span>
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-800">Bem-vindo</h2>
            <p className="text-gray-500">Acesse para gerenciar a sala</p>
          </div>

          {/* O formulário agora chama o handleLogin */}
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white p-4 rounded-xl font-bold text-xl active:scale-95 transition-transform shadow-lg disabled:opacity-70"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};