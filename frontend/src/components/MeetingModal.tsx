import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { X, AlertTriangle } from 'lucide-react';

interface Sector { id: string; name: string; color: string; }
interface MeetingType { id: string; name: string; }

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  existingMeeting?: any;
  onSuccess: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, selectedDate, existingMeeting, onSuccess }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);

  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  
  const [meetingDate, setMeetingDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [isCanceled, setIsCanceled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); 

  useEffect(() => {
    if (isOpen) {
      api.get('/sectors').then(res => setSectors(res.data));
      api.get('/meeting-types').then(res => setMeetingTypes(res.data));
      setIsConfirmingDelete(false); 
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;

    if (existingMeeting) {
      setTitle(existingMeeting.title);
      setSectorId(existingMeeting.sectorId);
      setIsCanceled(existingMeeting.canceled || false);
      
      const localStart = new Date(new Date(existingMeeting.startTime).getTime() - tzoffset);
      const localEnd = new Date(new Date(existingMeeting.endTime).getTime() - tzoffset);
      
      setMeetingDate(localStart.toISOString().split('T')[0]); // YYYY-MM-DD
      setStartHour(localStart.toISOString().slice(11, 16));   // HH:mm
      setEndHour(localEnd.toISOString().slice(11, 16));       // HH:mm
    } else if (selectedDate) {
      setTitle('');
      setSectorId('');
      
      const localStart = new Date(selectedDate.getTime() - tzoffset);
      setMeetingDate(localStart.toISOString().split('T')[0]);
      setStartHour(localStart.toISOString().slice(11, 16));
      
      const end = new Date(selectedDate);
      end.setHours(end.getHours() + 1);
      const localEnd = new Date(end.getTime() - tzoffset);
      setEndHour(localEnd.toISOString().slice(11, 16));
    }
  }, [selectedDate, existingMeeting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      const startDateTime = new Date(`${meetingDate}T${startHour}:00`);
      const endDateTime = new Date(`${meetingDate}T${endHour}:00`);

      const payload = {
        title,
        sectorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
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
      toast.error(error.response?.data?.error || 'Erro ao agendar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await api.delete(`/meetings/${existingMeeting.id}`);
      toast.success('Reunião cancelada com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao excluir a reunião');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* TELA DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {isConfirmingDelete ? (
          <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Cancelar Reunião?</h3>
            <p className="text-gray-500 mb-8 text-center">Isto irá remover a reunião da agenda permanentemente.</p>
            <div className="flex w-full gap-4">
              <button onClick={() => setIsConfirmingDelete(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold">Voltar</button>
              <button onClick={handleDelete} disabled={isSaving} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold">Sim, Cancelar</button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO NORMAL */
          <>
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{existingMeeting ? 'Editar Reunião' : 'Nova Reunião'}</h3>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo / Nome da Reunião</label>
                <select required className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none text-lg" value={title} onChange={e => setTitle(e.target.value)}>
                  <option value="" disabled hidden>Selecione o motivo...</option>
                  {existingMeeting && !meetingTypes.find(mt => mt.name === title) && title !== '' && <option value={title}>{title}</option>}
                  {meetingTypes.map(mt => <option key={mt.id} value={mt.name}>{mt.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Setor / Tag</label>
                <select required className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none text-lg" value={sectorId} onChange={e => setSectorId(e.target.value)}>
                  <option value="" disabled hidden>Selecione o setor...</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data da Reunião</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none text-lg cursor-pointer" 
                  value={meetingDate} 
                  onChange={e => setMeetingDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker()} 
                  onFocus={(e) => e.currentTarget.blur()} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Início</label>
                  <input 
                    type="time" 
                    required 
                    className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none text-lg cursor-pointer" 
                    value={startHour} 
                    onChange={e => setStartHour(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onFocus={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fim</label>
                  <input 
                    type="time" 
                    required 
                    className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none text-lg cursor-pointer" 
                    value={endHour} 
                    onChange={e => setEndHour(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onFocus={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>

              {existingMeeting && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <input 
                    type="checkbox" 
                    id="cancelar"
                    checked={isCanceled}
                    onChange={(e) => setIsCanceled(e.target.checked)}
                    className="w-6 h-6 text-red-500 rounded-md focus:ring-red-500 cursor-pointer accent-red-500"
                  />
                  <label htmlFor="cancelar" className="text-sm font-bold text-red-700 cursor-pointer select-none">
                    Marcar esta reunião como Cancelada
                  </label>
                </div>
              )}

              <button type="submit" disabled={isSaving} className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 disabled:opacity-50">
                {isSaving ? 'Aguarde...' : (existingMeeting ? 'Salvar Alterações' : 'Confirmar Agendamento')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};