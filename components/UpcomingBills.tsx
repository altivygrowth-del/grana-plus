import React from 'react';
import { CreditCard, ArrowRight, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUserStore } from '../store/userStore';

export const UpcomingBills: React.FC = () => {
  const cards = useUserStore((state) => state.cards);
  const transactions = useUserStore((state) => state.transactions);

  interface BillItem {
    id: string;
    title: string;
    due: string;
    amount: number;
    icon: any;
    iconBg: string;
  }

  const bills: BillItem[] = [];

  // 1. Credit Card bills with currentUsage > 0
  cards.forEach((card) => {
    if (card.currentUsage > 0) {
      bills.push({
        id: `card-due-${card.id}`,
        title: `Fatura ${card.name}`,
        due: card.dueDate ? `Vence ${card.dueDate}` : 'Fatura em aberto',
        amount: card.currentUsage,
        icon: CreditCard,
        iconBg: 'bg-purple-50 text-purple-600 border border-purple-100'
      });
    }
  });

  // 2. Pending transactions or future expenses
  const todayStr = new Date().toISOString().split('T')[0];
  transactions
    .filter((tx) => tx.type === 'expense' && (tx.status === 'pending' || tx.date >= todayStr))
    .slice(0, 3)
    .forEach((tx) => {
      const dateParts = tx.date ? tx.date.split('-') : [];
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : tx.date;

      bills.push({
        id: `tx-due-${tx.id}`,
        title: tx.description,
        due: formattedDate ? `Vence em ${formattedDate}` : 'Pendente',
        amount: tx.amount,
        icon: FileText,
        iconBg: 'bg-rose-50 text-rose-500 border border-rose-100'
      });
    });

  const displayBills = bills.slice(0, 3);

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
        PRÓXIMOS COMPROMISSOS
      </span>

      <div className="space-y-3 my-auto pt-1">
        {displayBills.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E6B4B] border border-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <p className="text-xs font-bold text-slate-800">Contas em dia!</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Nenhum compromisso ou fatura pendente.</p>
          </div>
        ) : (
          displayBills.map((bill) => {
            const Icon = bill.icon;
            return (
              <div key={bill.id} className="flex items-center justify-between py-1.5 px-2 rounded-2xl hover:bg-slate-50 transition-all duration-200 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${bill.iconBg} shadow-2xs`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {bill.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">{bill.due}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-900 tracking-tight shrink-0 ml-2">
                  {formatCurrency(bill.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100/60 mt-2">
        <span className="text-xs font-semibold text-slate-500">
          {bills.length} {bills.length === 1 ? 'compromisso encontrado' : 'compromissos encontrados'}
        </span>
      </div>
    </div>
  );
};
