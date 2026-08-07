import { UserStoreState, FinancialGoalItem, CreditCardItem } from '../store/userStore';
import { Transaction } from '../types/financial';

export type InsightType = 'informacao' | 'alerta' | 'conquista' | 'economia' | 'oportunidade';
export type InsightPriority = 'alta' | 'media' | 'baixa';

export interface FinancialInsight {
  id: string;
  titulo: string;
  descricao: string;
  tipo: InsightType;
  prioridade: InsightPriority;
  icone: string; // Icon identifier for Lucide mapping
  acaoSugerida: string;
  dataCriacao?: string;
}

// Priority weights for sorting (Alta = 3, Média = 2, Baixa = 1)
export const PRIORITY_WEIGHTS: Record<InsightPriority, number> = {
  alta: 3,
  media: 2,
  baixa: 1,
};

/**
 * Service to generate rule-based financial insights consuming the Zustand store.
 */
export function generateFinancialInsights(storeState: UserStoreState): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const { transactions, goals, cards, user, accounts } = storeState;

  // 1. Calculate general stats from current store data
  const totalBalance = accounts.length > 0 
    ? accounts.reduce((sum, acc) => sum + acc.balance, 0)
    : user.currentBalance;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  // ----------------------------------------------------
  // RULE 1: Goal Achievements (Conquista - Alta)
  // ----------------------------------------------------
  goals.forEach((goal) => {
    if (goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount) {
      insights.push({
        id: `conquista-goal-${goal.id}`,
        titulo: `Meta Concluída: ${goal.title}! 🎉`,
        descricao: `Parabéns! Você alcançou R$ ${goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (100% do objetivo de R$ ${goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
        tipo: 'conquista',
        prioridade: 'alta',
        icone: 'Trophy',
        acaoSugerida: 'Crie um novo objetivo ou realoque os aportes para outra meta ativa.',
        dataCriacao: 'Hoje'
      });
    }
  });

  // ----------------------------------------------------
  // RULE 2: Low Balance Warning (Alerta - Alta)
  // ----------------------------------------------------
  if (totalBalance < 1000 || (totalExpense > 0 && totalBalance < totalExpense * 0.4)) {
    insights.push({
      id: 'alerta-saldo-baixo',
      titulo: 'Atenção ao Saldo Disponível ⚠️',
      descricao: `Seu saldo acumulado atual (R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) está com margem reduzida em relação às despesas registradas.`,
      tipo: 'alerta',
      prioridade: 'alta',
      icone: 'AlertTriangle',
      acaoSugerida: 'Revise gastos não essenciais nas próximas semanas para evitar saldo negativo.',
      dataCriacao: 'Hoje'
    });
  }

  // ----------------------------------------------------
  // RULE 3: High Category Expense (Economia / Alerta - Média/Alta)
  // ----------------------------------------------------
  if (totalExpense > 0) {
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const pct = (amount / totalExpense) * 100;
      if (pct >= 30) {
        insights.push({
          id: `alerta-categoria-${category.toLowerCase().replace(/\s+/g, '-')}`,
          titulo: `Concentração em ${category}`,
          descricao: `A categoria "${category}" representa ${pct.toFixed(0)}% das suas despesas totais (R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
          tipo: pct >= 45 ? 'alerta' : 'economia',
          prioridade: pct >= 45 ? 'alta' : 'media',
          icone: 'TrendingUp',
          acaoSugerida: `Estipule um limite semanal reduzido para ${category} no próximo mês.`,
          dataCriacao: 'Hoje'
        });
      }
    });
  }

  // ----------------------------------------------------
  // RULE 4: Credit Card High Limit Utilization (Alerta - Alta)
  // ----------------------------------------------------
  cards.forEach((card) => {
    if (card.totalLimit > 0) {
      const usagePct = (card.currentUsage / card.totalLimit) * 100;
      if (usagePct >= 75) {
        insights.push({
          id: `alerta-cartao-${card.id}`,
          titulo: `Limite do Cartão ${card.name} elevado`,
          descricao: `Você utilizou ${usagePct.toFixed(0)}% do limite do cartão (R$ ${card.currentUsage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ ${card.totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
          tipo: 'alerta',
          prioridade: 'alta',
          icone: 'CreditCard',
          acaoSugerida: 'Evite novas compras parceladas até o vencimento da fatura.',
          dataCriacao: 'Hoje'
        });
      }
    }
  });

  // ----------------------------------------------------
  // RULE 5: Positive Savings Rate (Conquista / Economia - Média)
  // ----------------------------------------------------
  if (totalIncome > 0 && netSavings > 0) {
    const savingsRate = Math.round((netSavings / totalIncome) * 100);
    insights.push({
      id: 'superavit-financeiro',
      titulo: 'Superávit no Fluxo de Caixa 📈',
      descricao: `Sua receita superou suas despesas em R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${savingsRate}% de taxa de poupança).`,
      tipo: 'conquista',
      prioridade: 'media',
      icone: 'CheckCircle2',
      acaoSugerida: 'Direcione esse excedente para acelerar suas metas de investimento.',
      dataCriacao: 'Hoje'
    });
  }

  // ----------------------------------------------------
  // RULE 6: Goal Behind Schedule Recommendation (Oportunidade - Média)
  // ----------------------------------------------------
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  activeGoals.forEach((goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining > 0 && netSavings < remaining / 6) {
      insights.push({
        id: `oportunidade-meta-${goal.id}`,
        titulo: `Acelere a Meta: ${goal.title}`,
        descricao: `Para alcançar R$ ${goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, faltam R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Seu saldo mensal livre atual exige ajustes para manter o prazo.`,
        tipo: 'oportunidade',
        prioridade: 'media',
        icone: 'Target',
        acaoSugerida: 'Aumente o aporte mensal em R$ 150 ou simule um novo prazo no módulo de Planejamento.',
        dataCriacao: 'Hoje'
      });
    }
  });

  // ----------------------------------------------------
  // RULE 7: Emergency Fund Check (Oportunidade - Baixa)
  // ----------------------------------------------------
  const hasEmergencyFund = goals.some((g) => 
    g.title.toLowerCase().includes('reserva') || g.title.toLowerCase().includes('emergência')
  );
  if (!hasEmergencyFund) {
    insights.push({
      id: 'dica-reserva-emergencia',
      titulo: 'Construa sua Reserva de Emergência',
      descricao: 'Ter de 3 a 6 meses de despesas guardados garante segurança total para imprevistos financeiros.',
      tipo: 'oportunidade',
      prioridade: 'baixa',
      icone: 'Shield',
      acaoSugerida: 'Crie uma nova meta com foco em Reserva de Emergência na aba Metas.',
      dataCriacao: 'Hoje'
    });
  }

  // ----------------------------------------------------
  // RULE 8: General Financial Health (Informação - Baixa)
  // ----------------------------------------------------
  insights.push({
    id: 'info-saude-financeira',
    titulo: 'Organização e Controle',
    descricao: `Você possui ${transactions.length} movimentações registradas e ${goals.length} metas ativas acompanhadas pelo Grana+.`,
    tipo: 'informacao',
    prioridade: 'baixa',
    icone: 'Lightbulb',
    acaoSugerida: 'Mantenha os lançamentos atualizados diariamente para insights mais precisos.',
    dataCriacao: 'Hoje'
  });

  // Sort insights by priority (Alta -> Média -> Baixa)
  return insights.sort((a, b) => PRIORITY_WEIGHTS[b.prioridade] - PRIORITY_WEIGHTS[a.prioridade]);
}

/**
 * Returns the highest priority insight for dashboard widget display.
 */
export function getHighestPriorityInsight(storeState: UserStoreState): FinancialInsight {
  const insights = generateFinancialInsights(storeState);
  return insights[0] || {
    id: 'default-insight',
    titulo: 'Bom trabalho com suas finanças! 👏',
    descricao: 'Acompanhe regularmente suas receitas e despesas para manter o controle total do seu orçamento.',
    tipo: 'informacao',
    prioridade: 'media',
    icone: 'Sparkles',
    acaoSugerida: 'Cadastre suas movimentações diariamente no Grana+.',
    dataCriacao: 'Hoje'
  };
}
