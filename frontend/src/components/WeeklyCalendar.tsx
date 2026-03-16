import React from 'react';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // [8, 9, ..., 18]

export const WeeklyCalendar: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Cabeçalho dos Dias */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        <div className="p-2 border-r text-center text-xs font-bold text-gray-400 uppercase">Hora</div>
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-700 border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de Horários */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-7 border-b last:border-b-0 min-h-[60px]">
            {/* Coluna da Hora */}
            <div className="p-2 border-r bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500">
              {hour}:00
            </div>
            
            {/* Células clicáveis para cada dia */}
            {DAYS.map((_, index) => (
              <button
                key={index}
                onClick={() => alert(`Clicou às ${hour}:00 no dia ${DAYS[index]}`)}
                className="border-r last:border-r-0 hover:bg-blue-50/30 transition-colors active:bg-blue-100 flex items-start p-1"
              >
                {/* Caixinhas das reuniões agendadas */}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};