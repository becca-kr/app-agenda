import React, { useState, useEffect } from 'react';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); 

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  sector: { name: string; color: string; };
}

interface WeeklyCalendarProps {
  meetings: Meeting[];
  onCellClick: (date: Date) => void;
  onMeetingClick: (meeting: Meeting) => void;
  currentMonday: Date;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ meetings, onCellClick, onMeetingClick, currentMonday }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const jsDay = new Date().getDay(); 
  let todayIndex = jsDay - 1;
  if (todayIndex < 0 || todayIndex > 5) todayIndex = 0;

  const visibleDays = isMobile 
    ? [{ name: DAYS[todayIndex], originalIndex: todayIndex }] 
    : DAYS.map((name, i) => ({ name, originalIndex: i }));

  const getMeetingAt = (dayIndex: number, hour: number) => {
    return meetings.find(m => {
      const start = new Date(m.startTime);
      const end = new Date(m.endTime);
      
      const cellTime = new Date(currentMonday);
      cellTime.setDate(cellTime.getDate() + dayIndex);
      cellTime.setHours(hour, 0, 0, 0);

      return cellTime.getTime() >= start.getTime() && cellTime.getTime() < end.getTime();
    });
  };

  return (
    <div className="flex flex-col h-full bg-white text-sm">
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-7'} border-b bg-gray-50`}>
        <div className="p-3 border-r text-center font-bold text-gray-400">HORA</div>
        {visibleDays.map(day => (
          <div key={day.name} className="p-3 text-center font-bold text-gray-700 border-r last:border-r-0">
            {day.name} {isMobile && <span className="text-primary">(Hoje)</span>}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {HOURS.map(hour => (
          <div key={hour} className={`flex-1 grid ${isMobile ? 'grid-cols-2' : 'grid-cols-7'} border-b`}>
            
            <div className="border-r bg-gray-50 flex items-center justify-center font-medium text-gray-500 text-xs sm:text-sm">
              {hour}:00
            </div>
            
            {visibleDays.map((day) => {
              const meeting = getMeetingAt(day.originalIndex, hour);
              
              const cellDate = new Date(currentMonday);
              cellDate.setDate(cellDate.getDate() + day.originalIndex);
              cellDate.setHours(hour, 0, 0, 0);

              return (
                <div key={day.name} className="border-r last:border-r-0 p-1 relative group">
                  {meeting ? (
                    <div 
                      style={{ backgroundColor: meeting.sector.color }}
                      className="w-full h-full rounded-md p-1 sm:p-2 text-white shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col justify-center"
                      onClick={() => onMeetingClick(meeting)}
                    >
                      <p className="font-bold text-[8px] sm:text-[10px] uppercase opacity-80 truncate">{meeting.sector.name}</p>
                      <p className="font-medium text-xs sm:text-sm leading-tight truncate">{meeting.title}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => onCellClick(cellDate)}
                      className="w-full h-full hover:bg-gray-50 transition-colors rounded-md"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};