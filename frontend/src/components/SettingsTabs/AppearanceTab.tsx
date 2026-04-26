import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';

export const AppearanceTab: React.FC = () => {
  const { primaryColor: globalColor, logoUrl: globalLogo, footerText: globalFooter } = useConfig();
  
  const [color, setColor] = useState(globalColor);
  const [footer, setFooter] = useState(globalFooter);
  const [logo, setLogo] = useState(globalLogo || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setColor(globalColor);
    setFooter(globalFooter);
    setLogo(globalLogo || '');
  }, [globalColor, globalFooter, globalLogo]);

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/settings', { primaryColor: color, footerText: footer, companyLogo: logo });
      toast.success('Aparência salva! Reinicie a página para aplicar totalmente.');
    } catch (error) {
      toast.error('Erro ao salvar aparência');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10 flex flex-col lg:flex-row gap-10 overflow-y-auto h-full">
      <form onSubmit={handleSaveAppearance} className="flex-1 space-y-8 min-w-0">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Identidade Visual</h2>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Cor Primária</label>
          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              {['#0057FF', '#10B981', '#8B5CF6', '#F43F5E', '#0F172A'].map(preset => (
                <button key={preset} type="button" onClick={() => setColor(preset)} className={`w-12 h-12 rounded-full shadow-sm border-2 transition-transform hover:scale-110 shrink-0 ${color === preset ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: preset }} />
              ))}
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-full sm:w-max">
              <span className="text-xs font-bold text-gray-400 uppercase ml-2">Ou personalize:</span>
              <div className="flex gap-2 items-center ml-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded-lg cursor-pointer border-none shadow-sm shrink-0" />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-28 p-2 bg-white rounded-xl outline-none font-mono border border-gray-200 focus:border-primary text-center uppercase text-sm font-bold text-gray-700" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Texto do Rodapé</label>
          <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-primary text-gray-700" placeholder="Ex: © 2026 Minha Empresa" />
        </div>
        <button type="submit" disabled={isSaving} style={{ backgroundColor: color }} className="w-full py-4 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-70">
          <Save size={24} /> {isSaving ? 'Salvando...' : 'Salvar Aparência'}
        </button>
      </form>
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="flex flex-col h-full">
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Logo da Empresa</label>
          <div className="flex-1 relative bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-blue-50/50 transition-colors group flex flex-col items-center justify-center p-6 min-h-[240px] overflow-hidden">
            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setLogo(reader.result as string); reader.readAsDataURL(file); } }} />
            {logo ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <img src={logo} alt="Preview" className="max-h-24 max-w-full object-contain z-0" />
                <span className="text-xs font-bold text-gray-400 uppercase group-hover:text-primary transition-colors text-center">Clique para trocar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary transition-colors">
                <Upload size={32} />
                <span className="text-sm font-bold text-center">Clique ou arraste<br/>sua logo aqui</span>
              </div>
            )}
          </div>
          {logo && <button onClick={() => setLogo('')} className="mt-4 text-sm text-red-500 font-bold hover:underline self-center w-full text-center">Remover Imagem</button>}
        </div>
      </div>
    </div>
  );
};