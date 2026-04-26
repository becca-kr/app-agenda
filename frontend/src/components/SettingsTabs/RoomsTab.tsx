import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2 } from 'lucide-react';

export const RoomsTab: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  const fetchRooms = async () => {
    try { setRooms((await api.get('/rooms')).data); } catch (error) { toast.error('Erro ao carregar salas'); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSave = newRoomName.trim();
    if (!nameToSave || isAdding) return;

    try {
      setIsAdding(true);
      if (editingItemId) {
        await api.put(`/rooms/${editingItemId}`, { name: nameToSave });
        toast.success('Sala atualizada!');
      } else {
        await api.post('/rooms', { name: nameToSave });
        toast.success('Sala criada!');
      }
      setNewRoomName('');
      setEditingItemId(null);
      fetchRooms();
    } catch (error) { toast.error('Erro ao salvar sala'); } 
    finally { setIsAdding(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/rooms/${itemToDelete.id}`);
      toast.success('Sala excluída!');
      setItemToDelete(null);
      fetchRooms();
    } catch (error) { toast.error('Erro ao excluir sala. Pode ter reuniões vinculadas.'); }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      <form onSubmit={handleSave} className="shrink-0 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {editingItemId && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{editingItemId ? 'Editar Sala' : 'Cadastrar Nova Sala'}</h2>
          {editingItemId && <button type="button" onClick={() => { setEditingItemId(null); setNewRoomName(''); }} className="text-sm font-bold text-gray-500">Cancelar Edição</button>}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 items-end max-w-2xl">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Sala Física</label>
            <input 
              type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Ex: Sala de Inovação, Auditório..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"
            />
          </div>
          <button type="submit" disabled={isAdding} className={`w-full lg:w-auto h-[58px] px-8 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all mt-4 lg:mt-0 ${editingItemId ? 'bg-yellow-500' : 'bg-green-600'}`}>
            {isAdding ? 'Aguarde...' : (editingItemId ? 'Salvar Alterações' : 'Criar Sala')}
          </button>
        </div>
      </form>

      <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Salas Ativas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-primary/30">
              <span className="font-bold text-gray-700">{room.name}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingItemId(room.id); setNewRoomName(room.name); }} className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 size={18} /></button>
                <button onClick={() => setItemToDelete({ id: room.id, name: room.name })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && <p className="text-sm text-gray-400 col-span-full">Nenhuma sala cadastrada.</p>}
        </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Excluir Sala</h3>
            <p className="text-gray-500 mb-8">Apagar <strong>{itemToDelete.name}</strong>?</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-4 bg-gray-100 rounded-xl font-bold">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-4 bg-red-500 text-white rounded-xl font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};