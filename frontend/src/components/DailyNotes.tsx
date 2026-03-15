import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { FileText } from 'lucide-react';

export const DailyNotes: React.FC = () => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes').then(response => {
      setNote(response.data.content);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.post('/notes', { content: note });
      toast.success('Nota salva automaticamente!', {
        icon: '📝',
        duration: 2000,
      });
    } catch (error) {
      toast.error('Erro ao salvar nota');
    }
  };

  if (loading) return <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <FileText size={20} />
        <h3 className="font-bold text-lg">Notas do Dia</h3>
      </div>
      
      <textarea
        className="flex-1 w-full resize-none outline-none text-gray-700 leading-relaxed placeholder:text-gray-300"
        placeholder="Clique aqui para escrever lembretes da sala..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleSave}
      />
      
      <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">
        O sistema salva automaticamente ao sair do campo
      </div>
    </div>
  );
};