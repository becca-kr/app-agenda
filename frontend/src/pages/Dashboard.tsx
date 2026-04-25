import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { DailyNotes } from '../components/DailyNotes';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { MeetingModal } from '../components/MeetingModal';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { getMonday, formatDateTitle } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const { primaryColor, logoUrl, footerText } = useConfig();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [meetings, setMeetings] = useState([]);
  
  const [referenceDate, setReferenceDate] = useState(new Date());
  const currentMonday = getMonday(referenceDate);

  const handleOpenModal = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const fetchMeetings = async () => {
    const start = currentMonday.toISOString();
    const end = new Date(currentMonday);
    end.setDate(end.getDate() + 6);

    try {
      const response = await api.get(`/meetings?start=${start}&end=${end.toISOString()}`);
      setMeetings(response.data);
    } catch (error) {
      console.error("Erro ao buscar reuniões", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [referenceDate]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(referenceDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setReferenceDate(newDate);
  };

  const goToToday = () => setReferenceDate(new Date());

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white px-4 lg:px-8 py-4 shadow-sm flex justify-between items-center shrink-0">
        <img src={logoUrl || ''} alt="Logo" className="h-8 lg:h-10 object-contain" />
        <div className="flex items-center gap-4">
            <span className="hidden sm:block text-gray-500 font-medium">Sala Principal</span>
            <button 
              onClick={() => navigate('/settings')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Configurações"
            >
              <SettingsIcon size={24} className="text-gray-500" />
            </button>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-y-auto lg:overflow-hidden">
        
        {/* COLUNA ESQUERDA */}
        <div className="order-2 lg:order-1 w-full lg:w-[350px] flex flex-col gap-4 lg:gap-6 shrink-0 h-[600px] lg:h-full">
          <div className="flex-1 lg:h-1/2">
            <DailyNotes />
          </div>
          
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto flex flex-col">
             <h3 className="font-bold text-lg mb-4 text-gray-800">Próximas Reuniões</h3>
             <div className="flex-1 flex items-center justify-center">
               <span className="text-sm text-gray-400">Nenhuma reunião agora.</span>
             </div>
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

        {/* COLUNA DIREITA (Agenda Semanal) */}
        <div className="order-1 lg:order-2 flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[600px] lg:min-h-0">
          
          {/* Cabeçalho da Agenda com Navegação */}
          <div className="p-4 lg:p-6 border-b flex justify-between items-center shrink-0 bg-white">
            <div className="flex flex-col">
              <h3 className="font-bold text-lg lg:text-xl flex items-center gap-2 text-gray-800">
                <CalendarIcon className="text-primary" />
                {formatDateTitle(currentMonday)}
              </h3>
              <span className="text-xs text-gray-400 ml-7">Semana de {currentMonday.getFullYear()}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => navigateWeek('prev')} 
                className="p-1 hover:bg-white rounded transition-all text-gray-600 hover:text-gray-900 shadow-sm"
              >
                <ChevronLeft size={20}/>
              </button>
              <button 
                onClick={goToToday} 
                className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase hover:bg-white rounded transition-all text-gray-600 hover:text-gray-900 shadow-sm"
              >
                Hoje
              </button>
              <button 
                onClick={() => navigateWeek('next')} 
                className="p-1 hover:bg-white rounded transition-all text-gray-600 hover:text-gray-900 shadow-sm"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="flex-1 p-2 lg:p-4 bg-gray-50/50 flex flex-col overflow-hidden">
            <WeeklyCalendar 
              meetings={meetings} 
              onCellClick={handleOpenModal} 
              currentMonday={currentMonday} 
            />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-2 lg:p-4 text-center text-gray-400 text-xs lg:text-sm border-t bg-white shrink-0">
        {footerText}
      </footer>

      {/* MODAL */}
      <MeetingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={fetchMeetings}
      />
    </div>
  );
};