import React, { useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useUserStore } from '../store/userStore';
import { DinheiroLivreCard } from './DinheiroLivreCard';
import { SaldoSaudeRow } from './SaldoSaudeRow';
import { AiInsightCard } from './AiInsightCard';
import { UpcomingBills } from './UpcomingBills';
import { CreditCardsCard } from './CreditCardsCard';
import { FinancialGoals } from './FinancialGoals';
import { CashFlowChart } from './CashFlowChart';
import { RecentTransactions } from './RecentTransactions';

export const DashboardView: React.FC = () => {
  const { summary } = useFinancial();
  const cards = useUserStore((state) => state.cards);
  const goals = useUserStore((state) => state.goals);
  const fetchAccounts = useUserStore((state) => state.fetchAccounts);
  const fetchTransactions = useUserStore((state) => state.fetchTransactions);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Dynamically calculate health score based on real financial metrics
  const healthScore = Math.max(10, Math.min(100, Math.round(
    70 +
    (summary.totalBalance > 5000 ? 10 : summary.totalBalance < 500 ? -15 : 0) +
    (summary.totalIncome > 0 ? (summary.totalIncome >= summary.totalExpense ? 10 : -20) : 0) +
    (cards.length > 0 && cards[0].totalLimit > 0 && (cards[0].currentUsage / cards[0].totalLimit) > 0.8 ? -15 : 5) +
    (goals.length > 0 ? 5 : 0)
  )));

  return (
    <div className="space-y-6 lg:space-y-8 pb-16">
      {/* 1. Dinheiro Livre™ - Destaque Absoluto */}
      <section>
        <DinheiroLivreCard />
      </section>

      {/* 2. Saldo Atual & Saúde Financeira */}
      <section>
        <SaldoSaudeRow 
          totalBalance={summary.totalBalance} 
          healthScore={healthScore} 
        />
      </section>

      {/* 3. Grid de Destaques: Insight IA, Próximos Compromissos, Uso dos Cartões, Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <section className="h-full">
          <AiInsightCard />
        </section>

        <section className="h-full">
          <UpcomingBills />
        </section>

        <section className="h-full">
          <CreditCardsCard />
        </section>

        <section className="h-full">
          <FinancialGoals />
        </section>
      </div>

      {/* 4. Fluxo Financeiro */}
      <section>
        <CashFlowChart />
      </section>

      {/* 5. Timeline */}
      <section>
        <RecentTransactions />
      </section>
    </div>
  );
};
