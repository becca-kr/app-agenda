import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  existingMeeting?: any;
  onSuccess: () => void;
  selectedRoomId?: string;
}

const getLocalDateString = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const MeetingModal: React.FC<MeetingModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  existingMeeting, 
  onSuccess,
  selectedRoomId 
}) => {
  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  
  const [isCanceled, setIsCanceled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [sectors, setSectors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/sectors').then(res => setSectors(res.data));
      api.get('/rooms').then(res => setRooms(res.data));
      api.get('/meeting-types').then(res => setMeetingTypes(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingMeeting) {
      setTitle(existingMeeting.title);
      setSectorId(existingMeeting.sectorId);
      setRoomId(existingMeeting.roomId);
      setIsCanceled(existingMeeting.canceled || false);
      
      const start = new Date(existingMeeting.startTime);
      const end = new Date(existingMeeting.endTime);
      
      setMeetingDate(getLocalDateString(start));
      setStartTime(start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setEndTime(end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setTitle('');
      setSectorId('');
      setIsCanceled(false);
      setRoomId(selectedRoomId || '');
      
      const dateToUse = selectedDate || new Date();
      setMeetingDate(getLocalDateString(dateToUse));
      
      const hours = dateToUse.getHours().toString().padStart(2, '0');
      const minutes = dateToUse.getMinutes().toString().padStart(2, '0');
      
      if (hours === '00' && minutes === '00' && !selectedDate) {
        setStartTime('08:00');
        setEndTime('09:00');
      } else {
        setStartTime(`${hours}:${minutes}`);
        const endHour = (dateToUse.getHours() + 1).toString().padStart(2, '0');
        setEndTime(`${endHour}:${minutes}`);
      }
    }
  }, [existingMeeting, selectedDate, selectedRoomId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sectorId || !roomId || !meetingDate) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      setIsSaving(true);
      
      const startISO = new Date(`${meetingDate}T${startTime}:00`).toISOString();
      const endISO = new Date(`${meetingDate}T${endTime}:00`).toISOString();

      const payload = {
        title,
        sectorId,
        roomId,
        startTime: startISO,
        endTime: endISO,
        canceled: isCanceled
      };

      if (existingMeeting) {
        await api.put(`/meetings/${existingMeeting.id}`, payload);
        toast.success('Reunião atualizada!');
      } else {
        await api.post('/meetings', payload);
        toast.success('Reunião agendada!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar reunião');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onMouseDown={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800">
            {existingMeeting ? 'Editar Reunião' : 'Agendar Reunião'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase">
              <Tag size={16} className="text-primary" /> Motivo / Nome
            </label>
            <select 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">Selecione um motivo...</option>
              {meetingTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
              <option value="Outro (Especificar no título)">Outro...</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block uppercase">Setor / Tag</label>
              <select 
                value={sectorId} 
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Selecione o setor...</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase">
                <MapPin size={16} className="text-primary" /> Sala
              </label>
              <select 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Selecione a sala...</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* NOVOS CAMPOS: DATA, INÍCIO E FIM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase">
                <CalendarIcon size={16} /> Data
              </label>
              <input 
                type="date" 
                value={meetingDate} 
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase">
                <Clock size={16} /> Início
              </label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase">
                <Clock size={16} /> Fim
              </label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm"
              />
            </div>
          </div>

          {existingMeeting && (
            <div className={`p-4 rounded-2xl border transition-colors flex items-center gap-3 ${isCanceled ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              <input 
                type="checkbox" 
                id="cancel" 
                checked={isCanceled} 
                onChange={(e) => setIsCanceled(e.target.checked)}
                className="w-6 h-6 accent-red-500 cursor-pointer"
              />
              <label htmlFor="cancel" className="text-sm font-bold text-red-700 cursor-pointer select-none">
                Marcar como Reunião Cancelada
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Aguarde...' : (existingMeeting ? 'Salvar Alterações' : 'Confirmar Agendamento')}
          </button>
        </form>
      </div>
    </div>
  );
};