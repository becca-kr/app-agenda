import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2 } from 'lucide-react';

export const SectorsTab: React.FC = () => {
  const [cadastroType, setCadastroType] = useState<'sector' | 'meeting'>('sector');
  const [newCadastroName, setNewCadastroName] = useState('');
  const [newSectorColor, setNewSectorColor] = useState('#2196F3');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'sector' | 'meeting', name: string} | null>(null);

  const fetchDados = async () => {
    try {
      setSectors((await api.get('/sectors')).data);
      setMeetingTypes((await api.get('/meeting-types')).data);
    } catch (error) { toast.error('Erro ao carregar dados'); }
  };

  useEffect(() => { fetchDados(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const nameToSave = newCadastroName.trim();
    if (!nameToSave || isAdding) return;

    try {
      setIsAdding(true);
      const endpoint = cadastroType === 'sector' ? '/sectors' : '/meeting-types';
      const payload = cadastroType === 'sector' ? { name: nameToSave, color: newSectorColor } : { name: nameToSave };

      if (editingItemId) {
        await api.put(`${endpoint}/${editingItemId}`, payload);
        toast.success('Atualizado com sucesso!');
      } else {
        await api.post(endpoint, payload);
        toast.success('Cadastrado com sucesso!');
      }
      
      setNewCadastroName('');
      setEditingItemId(null);
      fetchDados();
    } catch (error) { toast.error('Erro ao salvar'); } 
    finally { setIsAdding(false); }
  };

  const handleEditClick = (item: any, type: 'sector' | 'meeting') => {
    setCadastroType(type);
    setNewCadastroName(item.name);
    if (type === 'sector') setNewSectorColor(item.color);
    setEditingItemId(item.id);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const endpoint = itemToDelete.type === 'sector' ? '/sectors' : '/meeting-types';
      await api.delete(`${endpoint}/${itemToDelete.id}`);
      toast.success('Excluído com sucesso!');
      setItemToDelete(null);
      fetchDados();
    } catch (error) { toast.error('Erro ao excluir. Pode ter reuniões vinculadas.'); }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      <form onSubmit={handleSave} className="shrink-0 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {editingItemId && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{editingItemId ? 'Editar Cadastro' : 'Adicionar Novo'}</h2>
          {editingItemId && <button type="button" onClick={() => { setEditingItemId(null); setNewCadastroName(''); }} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar Edição</button>}
        </div>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end max-w-5xl">
          <div className="w-full lg:w-48">
            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
            <select disabled={!!editingItemId} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" value={cadastroType} onChange={(e) => setCadastroType(e.target.value as any)}>
              <option value="sector">Setor</option>
              <option value="meeting">Nome da Reunião</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
            <input type="text" value={newCadastroName} onChange={(e) => setNewCadastroName(e.target.value)} placeholder="Ex: Diretoria" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
          </div>
          {cadastroType === 'sector' && (
            <div className="w-full lg:w-auto">
              <label className="block text-sm font-bold text-gray-700 mb-2">Cor</label>
              <div className="h-[58px] w-full lg:w-16 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative cursor-pointer" style={{ backgroundColor: newSectorColor }}>
                <input type="color" value={newSectorColor} onChange={(e) => setNewSectorColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 opacity-0 cursor-pointer" />
              </div>
            </div>
          )}
          <button type="submit" disabled={isAdding} className={`w-full lg:w-auto h-[58px] text-white px-8 rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 mt-4 lg:mt-0 ${editingItemId ? 'bg-yellow-500' : 'bg-green-600'}`}>
            {isAdding ? 'Aguarde...' : (editingItemId ? 'Salvar Alterações' : 'Salvar Cadastro')}
          </button>
        </div>
      </form>
      
      <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Setores</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
              {sectors.map(sector => (
                <div key={sector.id} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 hover:border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded shadow-sm shrink-0" style={{ backgroundColor: sector.color }} />
                    <span className="font-semibold text-gray-700 truncate">{sector.name}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEditClick(sector, 'sector')} className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 size={18} /></button>
                    <button onClick={() => setItemToDelete({ id: sector.id, type: 'sector', name: sector.name })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Nomes de Reunião</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
              {meetingTypes.map(mt => (
                <div key={mt.id} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 hover:border-gray-200">
                  <span className="font-semibold text-gray-700 truncate">{mt.name}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEditClick(mt, 'meeting')} className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 size={18} /></button>
                    <button onClick={() => setItemToDelete({ id: mt.id, type: 'meeting', name: mt.name })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Confirmar Exclusão</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">Apagar <strong>{itemToDelete.name}</strong>?</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-4 bg-red-500 text-white rounded-xl font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};