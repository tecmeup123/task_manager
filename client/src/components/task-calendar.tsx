import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format, parse, startOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useLocation } from 'wouter';
import { pt, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, ChevronLeft, ChevronRight, List, Columns3, CalendarDays } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

// Definindo os tipos
interface Task {
  id: number;
  editionId: number;
  taskCode: string;
  week: string;
  name: string;
  duration: string;
  dueDate: string;
  trainingType: string;
  links: string | null;
  assignedTo: string;
  assignedUserId: number | null;
  owner: string;
  status: string;
  inflexible: boolean;
  completionDate: string | null;
  notes: string | null;
}

interface TaskCalendarProps {
  tasks: Task[];
  editionId: number;
  isLoading: boolean;
}

type CalendarView = 'month' | 'week' | 'day';

export default function TaskCalendar({ tasks, editionId, isLoading }: TaskCalendarProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Estado para controlar a visualização do calendário
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [dayPickerMonth, setDayPickerMonth] = useState<Date>(new Date());

  // Locale para o calendário baseado na linguagem atual
  const locale = i18n.language === 'pt' ? pt : enUS;

  // Preparar os dias que têm tarefas
  const taskDays = useMemo(() => {
    return tasks.map(task => {
      const date = new Date(task.dueDate);
      return startOfDay(date);
    });
  }, [tasks]);

  // Função para verificar se um dia tem tarefas
  const dayHasTasks = (day: Date) => {
    return taskDays.some(taskDay => isSameDay(taskDay, day));
  };

  // Função para obter tarefas de um determinado dia
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return isSameDay(dueDate, day);
    });
  };

  // Função para obter tarefas para a semana atual
  const getTasksForWeek = (day: Date) => {
    const weekStart = startOfWeek(day, { locale });
    const weekEnd = endOfWeek(day, { locale });
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return isWithinInterval(dueDate, {
        start: weekStart,
        end: weekEnd
      });
    });
  };

  // Função para obter tarefas para o mês atual
  const getTasksForMonth = (day: Date) => {
    const monthStart = startOfMonth(day);
    const monthEnd = endOfMonth(day);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return isWithinInterval(dueDate, {
        start: monthStart,
        end: monthEnd
      });
    });
  };

  // Obter tarefas com base na visualização atual
  const visibleTasks = useMemo(() => {
    switch (view) {
      case 'day':
        return getTasksForDay(selectedDay);
      case 'week':
        return getTasksForWeek(selectedDay);
      case 'month':
        return getTasksForMonth(dayPickerMonth);
      default:
        return [];
    }
  }, [view, selectedDay, dayPickerMonth, tasks]);

  // Agrupando tarefas por data para visualização de semana e mês
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    if (view === 'week') {
      const weekStart = startOfWeek(selectedDay, { locale });
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dateKey = format(day, 'yyyy-MM-dd');
        grouped[dateKey] = getTasksForDay(day);
      }
    } else if (view === 'month') {
      const monthStart = startOfMonth(dayPickerMonth);
      const monthEnd = endOfMonth(dayPickerMonth);
      let current = monthStart;
      
      while (isBefore(current, monthEnd) || isSameDay(current, monthEnd)) {
        const dateKey = format(current, 'yyyy-MM-dd');
        grouped[dateKey] = getTasksForDay(current);
        current = addDays(current, 1);
      }
    } else {
      const dateKey = format(selectedDay, 'yyyy-MM-dd');
      grouped[dateKey] = getTasksForDay(selectedDay);
    }
    
    return grouped;
  }, [view, selectedDay, dayPickerMonth, tasks, locale]);

  // Renderizar o componente do dia com as tarefas
  const renderDayContent = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateKey] || [];
    const formattedDate = format(day, 'dd/MM/yyyy');
    
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">{formattedDate}</h3>
          <Badge variant="outline" className="text-xs">
            {dayTasks.length} {t('tasks')}
          </Badge>
        </div>
        
        {dayTasks.length > 0 ? (
          <div className="space-y-2">
            {dayTasks.map(task => {
              const statusColors = getStatusColor(task.status);
              return (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow p-2"
                  onClick={() => setLocation(`/task-details/${task.id}?editionId=${editionId}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{task.name}</p>
                      <p className="text-xs text-gray-500">{task.taskCode} · {task.assignedTo}</p>
                    </div>
                    <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                      {task.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('no_tasks_for_this_day')}</p>
        )}
      </div>
    );
  };

  // Renderizar visualização de semana
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDay, { locale });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {format(weekStart, 'MMMM d', { locale })} - {format(endOfWeek(selectedDay, { locale }), 'MMMM d, yyyy', { locale })}
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDay(addDays(startOfWeek(selectedDay, { locale }), -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDay(new Date())}
            >
              {t('today')}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDay(addDays(startOfWeek(selectedDay, { locale }), 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div key={format(day, 'yyyy-MM-dd')} className="border rounded-md overflow-hidden">
              <div className={`p-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {format(day, 'EEE', { locale })}
                <br />
                {format(day, 'd', { locale })}
              </div>
              <ScrollArea className="h-80">
                {renderDayContent(day)}
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar visualização de mês
  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {format(dayPickerMonth, 'MMMM yyyy', { locale })}
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setDayPickerMonth(new Date(dayPickerMonth.getFullYear(), dayPickerMonth.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const today = new Date();
                setDayPickerMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
            >
              {t('today')}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setDayPickerMonth(new Date(dayPickerMonth.getFullYear(), dayPickerMonth.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <style>
            {`
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-caption-font-size: 18px;
                --rdp-accent-color: var(--primary);
                --rdp-background-color: rgba(var(--primary) / 0.1);
                --rdp-accent-color-dark: var(--primary);
                --rdp-background-color-dark: rgba(var(--primary) / 0.2);
                margin: 0;
              }
              .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                background-color: var(--primary);
                color: var(--primary-foreground);
              }
              .task-day {
                position: relative;
              }
              .task-day::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: var(--primary);
              }
            `}
          </style>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={(day) => day && setSelectedDay(day)}
            month={dayPickerMonth}
            onMonthChange={setDayPickerMonth}
            locale={locale}
            modifiers={{
              taskDay: (day) => dayHasTasks(day),
            }}
            modifiersClassNames={{
              taskDay: 'task-day',
            }}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('tasks_for')} {format(dayPickerMonth, 'MMMM yyyy', { locale })}</CardTitle>
            <CardDescription>
              {visibleTasks.length} {t('tasks_scheduled')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {Object.keys(tasksByDate).sort().map(dateKey => {
                const tasks = tasksByDate[dateKey];
                if (tasks.length === 0) return null;
                
                const date = parse(dateKey, 'yyyy-MM-dd', new Date());
                
                return (
                  <div key={dateKey} className="border-b last:border-b-0">
                    {renderDayContent(date)}
                  </div>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar visualização de dia
  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {format(selectedDay, 'EEEE, MMMM d, yyyy', { locale })}
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDay(addDays(selectedDay, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedDay(new Date())}
            >
              {t('today')}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDay(addDays(selectedDay, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('tasks_for_day')}</CardTitle>
            <CardDescription>
              {visibleTasks.length} {t('tasks_scheduled')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh]">
              {renderDayContent(selectedDay)}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar o conteúdo com base na visualização
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <p>{t('loading')}</p>
        </div>
      );
    }

    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('task_calendar')}</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t('day')}
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            <Columns3 className="h-4 w-4 mr-1" />
            {t('week')}
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            {t('month')}
          </Button>
        </div>
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}