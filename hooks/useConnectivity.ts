
import { useState, useEffect } from 'react';
import { cacheService } from '../services/cacheService';
import { Attachment } from '../types';
import { useOnlineStatus } from './useOnlineStatus';

export const useConnectivity = (handleSendMessage: (text: string, attachment?: Attachment, isSyncingTask?: boolean) => Promise<void>) => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOnline) {
      syncOfflineTasks();
    }
  }, [isOnline]);

  const syncOfflineTasks = async () => {
    const pendingTasks = await cacheService.getPendingTasks();
    if (pendingTasks.length === 0) return;

    setIsSyncing(true);
    console.log(`Sincronizando ${pendingTasks.length} tarefas pendentes...`);

    for (const task of pendingTasks) {
      try {
        await handleSendMessage(task.text, task.attachment, true);
        await cacheService.markTaskSynced(task.id);
      } catch (error) {
        console.error(`Erro ao sincronizar tarefa ${task.id}:`, error);
      }
    }

    setIsSyncing(false);
  };

  return { isSyncing };
};
