import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { DailyNotes } from '../components/DailyNotes';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { MeetingModal } from '../components/MeetingModal';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const { primaryColor, logoUrl, footerText } = useConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [meetings, setMeetings] = useState([]);

  const handleOpenModal = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings');
      setMeetings(response.data); 
    } catch (error) {
      console.error("Erro ao buscar reuniões");
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      
      <header className="bg-white px-4 lg:px-8 py-4 shadow-sm flex justify-between items-center shrink-0">
        <img src={logoUrl || ''} alt="Logo" className="h-8 lg:h-10" />
        <div className="flex items-center gap-4">
            <span className="hidden sm:block text-gray-500 font-medium">Sala Principal</span>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200" />
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-y-auto lg:overflow-hidden">
        
        {/* COLUNA ESQUERDA (Notas e Botão) */}
        <div className="order-2 lg:order-1 w-full lg:w-[350px] flex flex-col gap-4 lg:gap-6 shrink-0 h-[600px] lg:h-full">
          <div className="flex-1 lg:h-1/2">
            <DailyNotes />
          </div>
          
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
             <h3 className="font-bold text-lg mb-4">Próximas Reuniões</h3>
             <div className="text-sm text-gray-400">Nenhuma reunião agora.</div>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            style={{ backgroundColor: primaryColor }}
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shrink-0"
          >
            <Plus size={24} />
            Agendar Reunião
          </button>
        </div>

        {/* COLUNA DIREITA (Agenda) */}
        <div className="order-1 lg:order-2 flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[600px] lg:min-h-0">
          <div className="p-4 lg:p-6 border-b flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg lg:text-xl flex items-center gap-2">
                <CalendarIcon className="text-primary" />
                Agenda Semanal
            </h3>
          </div>
          <div className="flex-1 p-2 lg:p-4 bg-gray-50/50 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col">
              <WeeklyCalendar meetings={meetings} onCellClick={handleOpenModal} />
            </div>
          </div>
        </div>
      </main>

      <footer className="p-2 lg:p-4 text-center text-gray-400 text-xs lg:text-sm border-t bg-white shrink-0">
        {footerText}
      </footer>

      <MeetingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={fetchMeetings}
      />
    </div>
  );
};