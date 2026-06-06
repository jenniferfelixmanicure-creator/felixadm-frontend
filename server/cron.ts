/**
 * Configuração de Cron Jobs para FelixADM
 * 
 * Este arquivo define os jobs que devem ser executados em intervalos regulares.
 * Pode ser usado com node-cron ou similar.
 */

import { checkOverdueInstallments, sendDailySalesSummary, sendUpcomingDueNotification } from "./notifications";

// Tipos de jobs disponíveis
export const CRON_JOBS = {
  // Verificar parcelas vencidas - a cada 6 horas
  CHECK_OVERDUE: {
    name: "check-overdue-installments",
    schedule: "0 */6 * * *", // 0:00, 6:00, 12:00, 18:00
    handler: checkOverdueInstallments,
    description: "Verifica parcelas vencidas e envia notificações",
  },

  // Resumo diário de vendas - 20:00 (8 PM)
  DAILY_SUMMARY: {
    name: "send-daily-sales-summary",
    schedule: "0 20 * * *", // 20:00 todos os dias
    handler: sendDailySalesSummary,
    description: "Envia resumo diário de vendas",
  },

  // Alerta de parcelas vencendo - 9:00 (9 AM)
  UPCOMING_DUE: {
    name: "send-upcoming-due-notification",
    schedule: "0 9 * * *", // 09:00 todos os dias
    handler: sendUpcomingDueNotification,
    description: "Alerta para parcelas vencendo em 3 dias",
  },
} as const;

// Executar job manualmente (para testes)
export async function runJob(jobName: keyof typeof CRON_JOBS) {
  const job = CRON_JOBS[jobName];
  console.log(`🔄 Executando job: ${job.name}`);
  console.log(`📝 ${job.description}`);
  
  try {
    const result = await job.handler();
    console.log(`✅ Job concluído com sucesso`);
    return result;
  } catch (error) {
    console.error(`❌ Erro ao executar job:`, error);
    throw error;
  }
}

// Exemplo de como usar com node-cron:
/*
import cron from 'node-cron';

Object.values(CRON_JOBS).forEach(job => {
  cron.schedule(job.schedule, async () => {
    console.log(`[${new Date().toISOString()}] Executando: ${job.name}`);
    try {
      await job.handler();
    } catch (error) {
      console.error(`Erro em ${job.name}:`, error);
    }
  });
  console.log(`✅ Job agendado: ${job.name} (${job.schedule})`);
});
*/

// Ou usar com Heartbeat (Manus):
/*
import { Heartbeat } from './server/_core/heartbeat';

const heartbeat = new Heartbeat();

Object.values(CRON_JOBS).forEach(job => {
  heartbeat.schedule(job.name, job.schedule, async () => {
    await job.handler();
  });
});
*/
