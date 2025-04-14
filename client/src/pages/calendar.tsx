import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

import MainLayout from '@/components/layouts/main-layout';
import TaskCalendar from '@/components/task-calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Função para extrair parâmetros da URL
function useQueryParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1]);
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Obter ID da edição da URL
  const urlEditionId = queryParams.get('editionId');
  const editionId = urlEditionId ? parseInt(urlEditionId) : undefined;

  // Buscar todas as edições
  const { data: editions = [], isLoading: editionsLoading } = useQuery<any[]>({
    queryKey: ["/api/editions"],
  });

  // Encontrar a edição atual
  const currentEdition = editionId 
    ? editions?.find((edition: any) => edition.id === editionId) 
    : editions?.[0];
  
  useEffect(() => {
    // Se as edições estão carregadas e nenhuma edição está selecionada, redirecionar para a primeira
    if (editions && editions.length > 0 && !editionId) {
      setLocation(`/calendar?editionId=${editions[0].id}`);
    }
  }, [editions, editionId, setLocation]);

  // Buscar tarefas para a edição atual
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: [`/api/editions/${currentEdition?.id}/tasks`],
    enabled: !!currentEdition?.id,
    staleTime: 60000, // Considerar dados frescos por 1 minuto para reduzir chamadas de API
    refetchOnWindowFocus: false, // Desativar refetching no foco da janela
  });

  const isLoading = editionsLoading || tasksLoading;

  return (
    <MainLayout>
      <div className="container max-w-7xl py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-col mb-4 md:mb-0">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : currentEdition ? (
              <>
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">{t('edition')}: {currentEdition.code}</h2>
                  <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">
                    {t('active')}
                  </Badge>
                </div>
                
                {/* Seletor de Edição */}
                <div className="mt-2">
                  <Select
                    value={editionId ? editionId.toString() : ''}
                    onValueChange={(value) => {
                      setLocation(`/calendar?editionId=${value}`);
                    }}
                    disabled={editionsLoading}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('switch_edition')} />
                    </SelectTrigger>
                    <SelectContent>
                      {editions.map(edition => (
                        <SelectItem key={edition.id} value={edition.id.toString()}>
                          {edition.code} ({edition.trainingType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <h2 className="text-xl font-semibold">{t('no_edition_selected')}</h2>
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <TaskCalendar 
              tasks={tasks} 
              editionId={currentEdition?.id} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}