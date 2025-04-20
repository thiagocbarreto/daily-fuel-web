'use client';

import { addDays, format, isSameDay } from "date-fns";

interface UserProgressCalendarProps {
  startDate: Date;
  durationDays: number;
  dailyLogs: Array<{ date: string }>;
  userName: string;
  isAuthUser: boolean;
}

export default function UserProgressCalendar({ 
  startDate, 
  durationDays, 
  dailyLogs,
  userName,
  isAuthUser
}: UserProgressCalendarProps) {
  // Generate array of dates for the challenge duration
  const challengeDates = Array.from({ length: durationDays }, (_, i) => 
    addDays(startDate, i)
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${isAuthUser ? 'border-orange-200' : ''}`}>
      <h3 className="font-medium text-gray-900 mb-4">{userName}</h3>
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-gray-500 font-medium text-center py-1">
            {day}
          </div>
        ))}
        
        {/* Empty cells before start date */}
        {Array.from({ length: startDate.getDay() }).map((_, i) => (
          <div key={`empty-start-${i}`} className="aspect-square" />
        ))}

        {/* Challenge days */}
        {challengeDates.map((date) => {
          const isLogged = dailyLogs.some(log => 
            isSameDay(new Date(log.date), date)
          );

          return (
            <div
              key={date.toISOString()}
              className={`
                aspect-square rounded-full flex items-center justify-center text-xs
                ${isLogged 
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20' 
                  : 'text-gray-500 bg-gray-50'
                }
              `}
            >
              {format(date, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
} 