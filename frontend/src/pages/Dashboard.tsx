import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { DailyNotes } from '../components/DailyNotes';
import { WeeklyCalendar } from '../components/WeeklyCalendar';
import { MeetingModal } from '../components/MeetingModal';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { primaryColor, logoUrl, footerText } = useConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleOpenModal = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsModalOpen(true);
  };

  const refreshMeetings = () => {
    console.log("Recarregar reuniões...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="bg-white px-8 py-4 shadow-sm flex justify-between items-center">
        <img src={logoUrl || ''} alt="Logo" className="h-10" />
        <div className="flex items-center gap-4">
            <span className="text-gray-500 font-medium">Sala Principal</span>
            <div className="w-10 h-10 rounded-full bg-gray-200" />
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        <div className="col-span-4 flex flex-col gap-6">
          <div className="h-1/2">
            <DailyNotes />
          </div>
          
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-4">Próximas Reuniões</h3>
             <div className="text-sm text-gray-400">Nenhuma reunião agora.</div>
          </div>

          {/* 2. Adicionar o onClick no botão */}
          <button 
            onClick={() => handleOpenModal()} 
            style={{ backgroundColor: primaryColor }}
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <Plus size={24} />
            Agendar Reunião
          </button>
        </div>

        <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center gap-2">
                <CalendarIcon className="text-primary" />
                Agenda Semanal
            </h3>
          </div>
          <div className="flex-1 p-4 bg-gray-50/50">
            <div className="flex-1 bg-gray-50/50">
              <WeeklyCalendar />
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-gray-400 text-sm border-t bg-white">
        {footerText}
      </footer>

      <MeetingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={refreshMeetings}
      />
    </div>
  );
};