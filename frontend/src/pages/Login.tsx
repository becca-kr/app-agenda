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
    // MUDANÇA: Usamos flex e garantimos que o container ocupe toda a tela
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* Esquerda: Imagem do Produto (Oculta em MD, MD-Vertical e menor, visível em LG e computadores grandes) */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center overflow-hidden">
        {/* Você pode tentar o caminho absoluto: src="/login-product.png" se tiver colocado a imagem na pasta public, ou o import padrão: */}
        <img 
          src="/src/assets/login-product.png"
          alt="Ambiente Sala de Reunião" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Direita: Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white min-w-0">
        <div className="w-full max-w-md space-y-10 scale-[0.9] sm:scale-100">
          
          <div className="flex flex-col items-center text-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Empresa" className="h-16 mb-6 object-contain" />
            ) : (
              <div className="h-20 w-20 bg-gray-200 rounded-full mb-6 flex items-center justify-center border border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Sua Logo</span>
              </div>
            )}
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Acesso à Sala</h2>
            <p className="text-gray-500 mt-2 text-lg">Gerencie o painel da sua sala de reunião</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Seu e-mail corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg shadow-inner bg-gray-50 focus:bg-white"
              />
              <input
                type="password"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg shadow-inner bg-gray-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white p-5 rounded-2xl font-bold text-xl active:scale-95 transition-transform shadow-lg shadow-primary/30 disabled:opacity-70 hover:brightness-110"
            >
              {isLoading ? 'Aguarde...' : 'Entrar na Sala'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};