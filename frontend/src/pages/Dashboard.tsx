import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [meetings, setMeetings] = useState([]);
  
  const [referenceDate, setReferenceDate] = useState(new Date());
  const currentMonday = getMonday(referenceDate);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const dailyMeetings = meetings
    .filter((m: any) => {
      const meetingDate = new Date(m.startTime).toLocaleDateString();
      const selectedDate = referenceDate.toLocaleDateString();
      return meetingDate === selectedDate;
    })
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleOpenModal = (date?: Date) => {
    setSelectedMeeting(null);
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const handleEditMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
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
    const newDate = new Date(currentMonday);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    newDate.setHours(12, 0, 0, 0);
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
          
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between mb-4 shrink-0">
               <h3 className="font-bold text-lg text-gray-800">Reuniões do Dia</h3>
               <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                 {dailyMeetings.length} {dailyMeetings.length === 1 ? 'total' : 'totais'}
               </span>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
               {dailyMeetings.length > 0 ? (
                 dailyMeetings.map((meeting: any) => {
                   const start = new Date(meeting.startTime);
                   const end = new Date(meeting.endTime);
                   const now = new Date();
                   
                   const isCanceled = meeting.canceled;
                   // Só é "Agora" se não estiver cancelada
                   const isNow = now >= start && now <= end && !isCanceled;

                   const timeString = `${start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} às ${end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;

                   return (
                     <div 
                        key={meeting.id} 
                        className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isCanceled 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : isNow 
                            ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                            : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
                        }`}
                        onClick={() => handleEditMeeting(meeting)}
                     >
                       <div className="flex items-center gap-2">
                         {/* Bolinha fica cinza se cancelado, senão cor normal (mesmo no passado) */}
                         <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: isCanceled ? '#9CA3AF' : meeting.sector.color }} />
                         <span className={`font-bold text-sm truncate ${isCanceled ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                           {meeting.title}
                         </span>
                         {isNow && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                       </div>
                       <div className="text-xs font-medium text-gray-500 ml-5 flex items-center">
                         {timeString} 
                         {isCanceled && <span className="text-red-500 font-bold ml-2 bg-red-50 px-2 py-0.5 rounded-md">• CANCELADA</span>}
                         {isNow && <span className="text-primary font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded-md">• AGORA</span>}
                       </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-50">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                     <CalendarIcon size={32} className="text-gray-400" />
                   </div>
                   <span className="text-sm text-gray-500 font-medium">Nenhum agendamento</span>
                 </div>
               )}
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
            <div 
              className="relative flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors group"
              onClick={() => datePickerRef.current?.showPicker()}
            >
              <CalendarIcon className="text-primary" />
              <h3 className="font-bold text-lg lg:text-xl text-gray-800 select-none">
                {formatDateTitle(referenceDate)}
              </h3>
              
              <input 
                type="date" 
                ref={datePickerRef}
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                onChange={(e) => {
                  if(e.target.value) setReferenceDate(new Date(e.target.value + 'T12:00:00'));
                }}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => navigateWeek('prev')} className="p-1 hover:bg-white rounded transition-all text-gray-600 shadow-sm"><ChevronLeft size={20}/></button>
              <button onClick={goToToday} className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase hover:bg-white rounded transition-all text-gray-600 shadow-sm">Hoje</button>
              <button onClick={() => navigateWeek('next')} className="p-1 hover:bg-white rounded transition-all text-gray-600 shadow-sm"><ChevronRight size={20}/></button>
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="flex-1 p-2 lg:p-4 bg-gray-50/50 flex flex-col overflow-hidden">
            <WeeklyCalendar 
              meetings={meetings} 
              onCellClick={handleOpenModal}
              onMeetingClick={handleEditMeeting} 
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
        existingMeeting={selectedMeeting}
        onSuccess={fetchMeetings}
      />
    </div>
  );
};