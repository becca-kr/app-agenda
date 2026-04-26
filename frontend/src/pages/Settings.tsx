import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, Upload, Trash2, Palette, Tags, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Sector {
  id: string;
  name: string;
  color: string;
}

interface MeetingType {
  id: string;
  name: string;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { primaryColor: globalColor, logoUrl: globalLogo, footerText: globalFooter } = useConfig();
  
  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'appearance' | 'sectors'>('appearance');

  // Estados da Aba 1 (Aparência)
  const [color, setColor] = useState(globalColor);
  const [footer, setFooter] = useState(globalFooter);
  const [logo, setLogo] = useState(globalLogo || '');

  // Estados da Aba 2 (Cadastros)
  const [cadastroType, setCadastroType] = useState<'sector' | 'meeting'>('sector');
  const [newCadastroName, setNewCadastroName] = useState('');
  const [newSectorColor, setNewSectorColor] = useState('#2196F3');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Listas
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);

  // Controle de Exclusão
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'sector' | 'meeting', name: string} | null>(null);

  useEffect(() => {
    setColor(globalColor);
    setFooter(globalFooter);
    setLogo(globalLogo || '');
  }, [globalColor, globalFooter, globalLogo]);

  useEffect(() => {
    if (activeTab === 'sectors') {
      fetchSectors();
      fetchMeetingTypes();
    }
  }, [activeTab]);

  const fetchSectors = async () => {
    try {
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (error) {
      toast.error('Erro ao carregar setores');
    }
  };

  const fetchMeetingTypes = async () => {
    try {
      const response = await api.get('/meeting-types');
      setMeetingTypes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar nomes de reunião');
    }
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      await api.put('/settings', { primaryColor: color, footerText: footer, companyLogo: logo });
      toast.success('Aparência salva! Reinicie para aplicar totalmente.');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveCadastro = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const nameToSave = newCadastroName.trim();
    if (!nameToSave || isAdding) return;

    try {
      setIsAdding(true);
      
      if (editingItemId) {

        if (cadastroType === 'sector') {
          await api.put(`/sectors/${editingItemId}`, { name: nameToSave, color: newSectorColor });
        } else {
          await api.put(`/meeting-types/${editingItemId}`, { name: nameToSave });
        }
        toast.success('Atualizado com sucesso!');
      } else {

        if (cadastroType === 'sector') {
          await api.post('/sectors', { name: nameToSave, color: newSectorColor });
        } else {
          await api.post('/meeting-types', { name: nameToSave });
        }
        toast.success('Cadastrado com sucesso!');
      }
      
      setNewCadastroName('');
      setEditingItemId(null);
      
      if (cadastroType === 'sector') fetchSectors();
      else fetchMeetingTypes();
      
    } catch (error) {
      toast.error(editingItemId ? 'Erro ao atualizar' : 'Erro ao cadastrar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (item: any, type: 'sector' | 'meeting') => {
    setCadastroType(type);
    setNewCadastroName(item.name);
    if (type === 'sector') setNewSectorColor(item.color);
    setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewCadastroName('');
    setNewSectorColor('#2196F3');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'sector') {
        await api.delete(`/sectors/${itemToDelete.id}`);
        fetchSectors();
      } else {
        await api.delete(`/meeting-types/${itemToDelete.id}`);
        fetchMeetingTypes();
      }
      toast.success('Excluído com sucesso!');
      setItemToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir. Pode ter reuniões vinculadas.');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Header Fixo */}
      <header className="bg-white px-8 py-6 shadow-sm flex items-center gap-4 shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Painel de Configurações</h1>
      </header>

      {/* Conteúdo Central */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Menu Lateral Fixo */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2">
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all flex-1 lg:flex-none ${activeTab === 'appearance' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}
          >
            <Palette size={20} /> <span className="hidden sm:inline">Aparência</span>
          </button>
          <button 
            onClick={() => setActiveTab('sectors')}
            className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all flex-1 lg:flex-none ${activeTab === 'sectors' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}
          >
            <Tags size={20} /> <span className="hidden sm:inline">Setores / Tags</span>
          </button>
        </aside>

        {/* MAIN DINÂMICO */}
        <main className="flex-1 overflow-hidden flex flex-col pb-4">
          
          {/* ABA 1: APARÊNCIA */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10 flex flex-col lg:flex-row gap-10 overflow-y-auto">
              {/* O formulário usa flex-1 para ocupar o espaço que sobrar */}
              <form onSubmit={handleSaveAppearance} className="flex-1 space-y-8 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Identidade Visual</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Cor Primária</label>
                  
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-3">
                      {['#0057FF', '#10B981', '#8B5CF6', '#F43F5E', '#0F172A'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setColor(preset)}
                          className={`w-12 h-12 rounded-full shadow-sm border-2 transition-transform hover:scale-110 shrink-0 ${color === preset ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: preset }}
                        />
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

                <button 
                  type="submit" 
                  disabled={isAdding}
                  style={{ backgroundColor: color }} 
                  className="w-full py-4 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-70"
                >
                  <Save size={24} /> {isAdding ? 'Salvando...' : 'Salvar Aparência'}
                </button>
              </form>

              <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Logo da Empresa</label>
                  
                  <div className="flex-1 relative bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-blue-50/50 transition-colors group flex flex-col items-center justify-center p-6 min-h-[240px] overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    
                    {logo ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <img src={logo} alt="Preview" className="max-h-24 max-w-full object-contain z-0" />
                        <span className="text-xs font-bold text-gray-400 uppercase group-hover:text-primary transition-colors text-center">Clique para trocar</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary transition-colors">
                        <Upload size={32} />
                        <span className="text-sm font-bold text-center">Clique ou arraste<br/>sua logo aqui</span>
                        <span className="text-xs opacity-70">PNG, JPG ou SVG</span>
                      </div>
                    )}
                  </div>
                  
                  {logo && (
                    <button 
                      onClick={() => setLogo('')}
                      className="mt-4 text-sm text-red-500 font-bold hover:underline self-center w-full text-center"
                    >
                      Remover Imagem
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CADASTROS */}
          {activeTab === 'sectors' && (
            <div className="flex flex-col h-full space-y-6 overflow-hidden">
              
              {/* CARD: ADICIONAR / EDITAR */}
              <form onSubmit={handleSaveCadastro} className="shrink-0 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                {editingItemId && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingItemId ? 'Editar Cadastro' : 'Adicionar Novo'}
                  </h2>
                  {editingItemId && (
                    <button type="button" onClick={handleCancelEdit} className="text-sm font-bold text-gray-500 hover:text-gray-700">
                      Cancelar Edição
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end max-w-5xl">
                  <div className="w-full lg:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                    <select 
                      disabled={!!editingItemId} 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={cadastroType}
                      onChange={(e) => setCadastroType(e.target.value as 'sector' | 'meeting')}
                    >
                      <option value="sector">Setor / Tag</option>
                      <option value="meeting">Nome da Reunião</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                    <input 
                      type="text" 
                      value={newCadastroName}
                      onChange={(e) => setNewCadastroName(e.target.value)}
                      placeholder={cadastroType === 'sector' ? "Ex: Diretoria" : "Ex: Apresentação de Resultados"}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"
                    />
                  </div>

                  {cadastroType === 'sector' && (
                    <div className="w-full lg:w-auto">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cor</label>
                      <div 
                        className="h-[58px] w-full lg:w-16 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: newSectorColor }}
                      >
                        <input 
                          type="color" 
                          value={newSectorColor} 
                          onChange={(e) => setNewSectorColor(e.target.value)} 
                          className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 opacity-0 cursor-pointer" 
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isAdding}
                    className={`w-full lg:w-auto h-[58px] text-white px-8 rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 mt-4 lg:mt-0 ${editingItemId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isAdding ? 'Aguarde...' : (editingItemId ? 'Salvar Alterações' : 'Salvar Cadastro')}
                  </button>
                </div>
              </form>

              {/* CARD: LISTAS */}
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                  
                  {/* LISTA DE SETORES */}
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Setores</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                      {sectors.map(sector => (
                        <div key={sector.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${editingItemId === sector.id ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded shadow-sm shrink-0" style={{ backgroundColor: sector.color }} />
                            <span className="font-semibold text-gray-700 truncate">{sector.name}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEditClick(sector, 'sector')} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => setItemToDelete({ id: sector.id, type: 'sector', name: sector.name })} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {sectors.length === 0 && <p className="text-sm text-gray-400">Nenhum setor cadastrado.</p>}
                    </div>
                  </div>

                  {/* LISTA DE REUNIÕES */}
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Nomes de Reunião</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                      {meetingTypes.map(mt => (
                        <div key={mt.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${editingItemId === mt.id ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                          <span className="font-semibold text-gray-700 truncate">{mt.name}</span>
                          <div className="flex gap-1 shrink-0">
                             <button onClick={() => handleEditClick(mt, 'meeting')} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => setItemToDelete({ id: mt.id, type: 'meeting', name: mt.name })} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {meetingTypes.length === 0 && <p className="text-sm text-gray-400">Nenhum nome cadastrado.</p>}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MODAL DE EXCLUSÃO */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              Excluir {itemToDelete.type === 'sector' ? 'Setor' : 'Reunião'}
            </h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">
              Tem a certeza que deseja apagar <strong>{itemToDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 px-4 py-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="flex-1 px-4 py-4 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};