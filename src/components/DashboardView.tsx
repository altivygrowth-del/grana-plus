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
  const accounts = useUserStore((state) => state.accounts);
  const transactions = useUserStore((state) => state.transactions);
  const cards = useUserStore((state) => state.cards);
  const goals = useUserStore((state) => state.goals);

  const fetchAccounts = useUserStore((state) => state.fetchAccounts);
  const fetchTransactions = useUserStore((state) => state.fetchTransactions);
  const fetchCards = useUserStore((state) => state.fetchCards);
  const fetchGoals = useUserStore((state) => state.fetchGoals);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchCards();
    fetchGoals();
  }, [fetchAccounts, fetchTransactions, fetchCards, fetchGoals]);

  const hasData = accounts.length > 0 || transactions.length > 0 || cards.length > 0 || goals.length > 0 || summary.totalBalance > 0;

  // Dynamically calculate health score based on real financial metrics
  const healthScore = !hasData ? 0 : Math.max(10, Math.min(100, Math.round(
    50 +
    (summary.totalBalance >= 5000 ? 20 : summary.totalBalance >= 1000 ? 10 : summary.totalBalance < 500 ? -10 : 0) +
    (summary.totalIncome > 0 ? (summary.totalIncome >= summary.totalExpense ? 15 : -15) : 0) +
    (cards.length > 0 && cards[0].totalLimit > 0 ? ((cards[0].currentUsage / cards[0].totalLimit) < 0.5 ? 10 : (cards[0].currentUsage / cards[0].totalLimit) > 0.8 ? -15 : 0) : 0) +
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
          hasData={hasData}
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
