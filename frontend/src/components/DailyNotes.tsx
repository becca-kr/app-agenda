import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface DailyNotesProps {
  date: Date;
}

export const DailyNotes: React.FC<DailyNotesProps> = ({ date }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dateString = date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await api.get(`/notes?date=${dateString}`);
        setContent(response.data.content);
      } catch (error) {
        console.error('Erro ao buscar nota', error);
      }
    };
    fetchNote();
  }, [dateString]);

  const handleBlur = async () => {
    try {
      setIsSaving(true);
      await api.post('/notes', { date: dateString, content });
    } catch (error) {
      toast.error('Erro ao salvar as notas.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
         <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
           <FileText className="text-gray-400" size={20} />
           Notas do Dia
         </h3>
         {isSaving && <span className="text-xs text-primary font-bold animate-pulse">Salvando...</span>}
      </div>
      
      <textarea
        className="flex-1 w-full resize-none outline-none text-gray-600 bg-transparent leading-relaxed"
        placeholder="Clique aqui para escrever lembretes da sala..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur} 
      />
    </div>
  );
};