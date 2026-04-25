import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  color: string;
}
interface MeetingType {
  id: string;
  name: string;
}

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onSuccess: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, selectedDate, onSuccess }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]); 

  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/sectors').then(res => setSectors(res.data));
      api.get('/meeting-types').then(res => setMeetingTypes(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && isOpen) {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
      const localISOTime = (new Date(selectedDate.getTime() - tzoffset)).toISOString().slice(0, 16);
      setStartTime(localISOTime);
      
      const end = new Date(selectedDate);
      end.setHours(end.getHours() + 1);
      const localISOEndTime = (new Date(end.getTime() - tzoffset)).toISOString().slice(0, 16);
      setEndTime(localISOEndTime);

      setTitle('');
      setSectorId('');
    }
  }, [selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Nova Reunião</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo / Nome da Reunião</label>
            <select 
              required
              className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg appearance-none cursor-pointer"
              value={title}
              onChange={e => setTitle(e.target.value)}
            >
              <option value="" disabled hidden>Selecione o motivo...</option>
              {meetingTypes.map(mt => (
                <option key={mt.id} value={mt.name}>{mt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Setor / Tag</label>
            <select 
              required
              className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg appearance-none cursor-pointer"
              value={sectorId}
              onChange={e => setSectorId(e.target.value)}
            >
              <option value="" disabled hidden>Selecione o setor...</option>
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
            disabled={isSaving}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
};