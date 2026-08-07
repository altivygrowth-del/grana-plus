import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, ArrowDownRight, Wallet } from 'lucide-react';
import { useUserStore, CreditCardItem } from '../store/userStore';
import { transactionsService } from '../services/transactions/transactions.service';

interface PayInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCardItem | null;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  isOpen,
  onClose,
  card
}) => {
  const accounts = useUserStore((state) => state.accounts);
  const updateAccount = useUserStore((state) => state.updateAccount);
  const updateCard = useUserStore((state) => state.updateCard);
  const fetchTransactions = useUserStore((state) => state.fetchTransactions);

  const [accountId, setAccountId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      setPayAmount(String(card.currentUsage || 0));
    }
    if (accounts.length > 0 && (!accountId || !accounts.some((a) => a.id === accountId))) {
      setAccountId(accounts[0].id);
    }
  }, [card, accounts, isOpen]);

  if (!isOpen || !card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(payAmount.replace(',', '.'));
    const chosenAccount = accounts.find((a) => a.id === accountId);

    if (isNaN(amountVal) || amountVal <= 0 || !chosenAccount) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Reduce card used limit
      const newCardUsage = Math.max(0, (card.currentUsage || 0) - amountVal);
      await updateCard(card.id, { currentUsage: newCardUsage });

      // 2. Deduct amount from chosen account balance
      const newAccountBalance = chosenAccount.balance - amountVal;
      await updateAccount(chosenAccount.id, { balance: newAccountBalance });

      // 3. Create expense transaction
      await transactionsService.createTransaction({
        description: `Pagamento Fatura - ${card.name}`,
        amount: amountVal,
        type: 'expense',
        category: 'Outros',
        accountId: chosenAccount.id,
        accountName: chosenAccount.name,
        paymentMethod: 'Pix',
        date: payDate,
        status: 'completed',
        notes: `Pagamento da fatura do cartão ${card.name} debitado da conta ${chosenAccount.name}`
      });

      // 4. Refresh transactions
      await fetchTransactions();

      onClose();
    } catch (err) {
      console.error('Erro ao pagar fatura:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Pagar Fatura - {card.name}
              </h3>
              <p className="text-xs text-slate-400">
                Debite de uma conta bancária para liberar seu limite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Card Summary Badge */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fatura Atual
              </span>
              <span className="text-lg font-extrabold text-amber-600">
                R$ {(card.currentUsage || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vencimento
              </span>
              <span className="text-xs font-bold text-slate-800">
                {card.dueDate || 'Dia 12'}
              </span>
            </div>
          </div>

          {/* Account to debit from */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Conta para Débito <span className="text-rose-500">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) - Saldo: R${' '}
                  {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Valor a Pagar & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Valor a Pagar (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Data do Pagamento
              </label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || accounts.length === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/10 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
