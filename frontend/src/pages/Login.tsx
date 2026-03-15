import React from 'react';
import { useConfig } from '../context/ConfigContext';

export const Login: React.FC = () => {
  const { logoUrl, primaryColor } = useConfig();

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

          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg"
              />
              <input
                type="password"
                placeholder="Senha"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white p-4 rounded-xl font-bold text-xl active:scale-95 transition-transform shadow-lg"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};