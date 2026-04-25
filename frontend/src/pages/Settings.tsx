import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
  const { primaryColor: globalColor, logoUrl: globalLogo, footerText: globalFooter } = useConfig();
  
  const [color, setColor] = useState(globalColor);
  const [footer, setFooter] = useState(globalFooter);
  const [logo, setLogo] = useState(globalLogo || '');

  useEffect(() => {
    setColor(globalColor);
    setFooter(globalFooter);
    setLogo(globalLogo || '');
  }, [globalColor, globalFooter, globalLogo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        primaryColor: color,
        footerText: footer,
        companyLogo: logo 
      });
      toast.success('Configurações salvas! Reinicie para aplicar totalmente.');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-white rounded-full transition-all">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h1>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Formulário Principal */}
          <form onSubmit={handleSave} className="col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cor Identidade (Primária)</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-14 w-20 rounded-lg cursor-pointer border-none"
                  />
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 p-4 bg-gray-100 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Texto do Rodapé</label>
                <input 
                  type="text" 
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className="w-full p-4 bg-gray-100 rounded-xl outline-none"
                  placeholder="Ex: © 2026 Minha Empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">URL da Logo</label>
                <div className="flex gap-4">
                   <input 
                    type="text" 
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="flex-1 p-4 bg-gray-100 rounded-xl outline-none"
                    placeholder="Link da imagem ou base64"
                  />
                </div>
              </div>

              <button 
                type="submit"
                style={{ backgroundColor: color }}
                className="w-full py-4 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Save size={24} />
                Salvar Alterações
              </button>
            </div>
          </form>

          {/* Preview em Tempo Real */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs">Prévia do Botão</h3>
              <button style={{ backgroundColor: color }} className="w-full py-3 rounded-xl text-white font-medium">
                Botão de Exemplo
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
              <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs self-start">Prévia da Logo</h3>
              {logo ? (
                <img src={logo} alt="Logo Preview" className="h-20 object-contain" />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                  <Upload size={32} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};