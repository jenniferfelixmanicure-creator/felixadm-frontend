import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { eq, lt, gte, lte, and } from "drizzle-orm";
import { installments, sales } from "../drizzle/schema";

/**
 * Verifica parcelas vencidas e envia notificações
 * Deve ser executado diariamente via cron job
 */
export async function checkOverdueInstallments() {
  try {
    const now = new Date();
    const db = await getDb();
    
    if (!db) {
      console.warn("[Database] Cannot check overdue: database not available");
      return [];
    }
    
    // Buscar parcelas vencidas não pagas
    const overdueInstallments = await db
      .select()
      .from(installments)
      .where(
        and(
          eq(installments.status, "pending"),
          lt(installments.dueDate, now)
        )
      )
      .limit(100);

    if (overdueInstallments.length === 0) {
      console.log("✅ Nenhuma parcela vencida encontrada");
      return;
    }

    // Agrupar por cliente para melhor notificação
    const totalAmount = overdueInstallments.reduce(
      (sum: number, inst: any) => sum + parseFloat(inst.amount),
      0
    );

    const message = `
⚠️ **${overdueInstallments.length} Parcelas Vencidas**

Total em atraso: R$ ${totalAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}

Verifique o app para mais detalhes.
    `.trim();

    // Enviar notificação ao proprietário
    const success = await notifyOwner({
      title: "⚠️ Parcelas Vencidas",
      content: message,
    });

    if (success) {
      console.log(`✅ Notificação enviada: ${overdueInstallments.length} parcelas vencidas`);
    } else {
      console.warn("⚠️ Falha ao enviar notificação de parcelas vencidas");
    }

    return overdueInstallments;
  } catch (error) {
    console.error("❌ Erro ao verificar parcelas vencidas:", error);
    throw error;
  }
}

/**
 * Envia resumo diário de vendas
 */
export async function sendDailySalesSummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot send summary: database not available");
      return [];
    }

    // Buscar vendas do dia
    const todaysSales = await db
      .select()
      .from(sales)
      .where(
        and(
          gte(sales.createdAt, today),
          lt(sales.createdAt, tomorrow)
        )
      );

    if (todaysSales.length === 0) {
      console.log("ℹ️ Nenhuma venda hoje");
      return;
    }

    const totalRevenue = todaysSales.reduce(
      (sum: number, sale: any) => sum + parseFloat(sale.totalAmount),
      0
    );

    const message = `
📊 **Resumo de Vendas - ${today.toLocaleDateString("pt-BR")}**

Total de vendas: ${todaysSales.length}
Receita: R$ ${totalRevenue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}

Acesse o app para mais detalhes.
    `.trim();

    const success = await notifyOwner({
      title: "📊 Resumo de Vendas",
      content: message,
    });

    if (success) {
      console.log(`✅ Resumo diário enviado: ${todaysSales.length} vendas`);
    }

    return todaysSales;
  } catch (error) {
    console.error("❌ Erro ao enviar resumo de vendas:", error);
    throw error;
  }
}

/**
 * Envia alerta para parcelas vencendo em 3 dias
 */
export async function sendUpcomingDueNotification() {
  try {
    const today = new Date();
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    const db = await getDb();
    if (!db) {
      console.warn("[Database] Cannot send notification: database not available");
      return [];
    }

    // Buscar parcelas vencendo em 3 dias
    const upcomingInstallments = await db
      .select()
      .from(installments)
      .where(
        and(
          eq(installments.status, "pending"),
          gte(installments.dueDate, today),
          lte(installments.dueDate, in3Days)
        )
      )
      .limit(100);

    if (upcomingInstallments.length === 0) {
      console.log("✅ Nenhuma parcela vencendo em 3 dias");
      return;
    }

    const totalAmount = upcomingInstallments.reduce(
      (sum: number, inst: any) => sum + parseFloat(inst.amount),
      0
    );

    const message = `
📅 **${upcomingInstallments.length} Parcelas Vencendo em 3 Dias**

Total: R$ ${totalAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}

Lembre seus clientes sobre os pagamentos.
    `.trim();

    const success = await notifyOwner({
      title: "📅 Parcelas Próximas de Vencer",
      content: message,
    });

    if (success) {
      console.log(`✅ Alerta enviado: ${upcomingInstallments.length} parcelas vencendo`);
    }

    return upcomingInstallments;
  } catch (error) {
    console.error("❌ Erro ao enviar alerta de parcelas vencendo:", error);
    throw error;
  }
}
