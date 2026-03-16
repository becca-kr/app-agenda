import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  color: string;
}

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onSuccess: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, selectedDate, onSuccess }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/sectors').then(res => setSectors(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      const formatted = selectedDate.toISOString().substring(0, 16);
      setStartTime(formatted);
      
      const end = new Date(selectedDate);
      end.setHours(end.getHours() + 1);
      setEndTime(end.toISOString().substring(0, 16));
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/meetings', {
        title,
        sectorId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      toast.success('Reunião agendada com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao agendar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Nova Reunião</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Reunião</label>
            <input 
              required
              className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Alinhamento Semanal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Setor</label>
            <select 
              required
              className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg appearance-none"
              value={sectorId}
              onChange={e => setSectorId(e.target.value)}
            >
              <option value="">Selecione o setor...</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Início</label>
              <input 
                type="datetime-local"
                required
                className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fim</label>
              <input 
                type="datetime-local"
                required
                className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all"
          >
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
};