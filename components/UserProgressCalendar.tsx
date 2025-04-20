'use client';

import { addDays, format, isBefore, isAfter, isSameDay, startOfDay } from "date-fns";
import { createClient } from "@/libs/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UserProgressCalendarProps {
  startDate: Date;
  durationDays: number;
  dailyLogs: Array<{ id: string; date: string }>;
  userName: string;
  challengeId: string;
  authUserId?: string;
}

export default function UserProgressCalendar({ 
  startDate, 
  durationDays, 
  dailyLogs,
  userName,
  authUserId,
  challengeId
}: UserProgressCalendarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState(dailyLogs);
  const supabase = createClient();

  // Generate array of dates for the challenge duration
  const challengeDates = Array.from({ length: durationDays }, (_, i) => 
    addDays(startDate, i)
  );

  const handleDayClick = async (date: Date) => {
    if (!authUserId) {
      console.log('Not auth user, returning early');
      return;
    }
    
    setLoading(date.toISOString());
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      const existingLog = logs.find(log => {
        const logDate = new Date(log.date);
        logDate.setMinutes(logDate.getMinutes() + new Date().getTimezoneOffset());
        return isSameDay(logDate, date);
      });

      console.log('------> existingLog', existingLog);
      
      if (existingLog) {
        // Remove log
        const { error } = await supabase
          .from('daily_logs')
          .delete()
          .eq('id', existingLog.id);

        if (error) throw error;
        
        setLogs(logs.filter(log => log.id !== existingLog.id));
      } else {
        // Add new log
        const { data, error } = await supabase
          .from('daily_logs')
          .insert([
            {
              user_id: authUserId,
              challenge_id: challengeId,
              date: formattedDate,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        
        setLogs([...logs, data]);
      }
    } catch (error) {
      console.error('Error updating daily log:', error);
    } finally {
      setLoading(null);
    }
  };

  const today = startOfDay(new Date());

  console.log('------> logs', logs);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${authUserId ? 'border-orange-200' : ''}`}>
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
          const isLogged = logs.some(log => {
            const logDate = new Date(log.date);
            logDate.setMinutes(logDate.getMinutes() + new Date().getTimezoneOffset());
            return isSameDay(logDate, date);
          });
          const isLoading = loading === date.toISOString();
          const isPast = isBefore(date, today);
          const isFuture = isAfter(date, today);
          const isClickable = !!authUserId && !isFuture;

          return (
            <button
              key={date.toISOString()}
              onClick={() => isClickable && handleDayClick(date)}
              disabled={!isClickable || isLoading}
              className={`
                aspect-square rounded-full flex items-center justify-center text-xs
                ${isLogged 
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20' 
                  : isPast
                    ? 'text-red-500 bg-red-50'
                    : isFuture
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-500 bg-gray-50'
                }
                ${!!authUserId && !isFuture ? 'cursor-pointer hover:ring-2 hover:ring-orange-200' : ''}
                transition-all
              `}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                format(date, 'd')
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 