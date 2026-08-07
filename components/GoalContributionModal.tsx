import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Check, Wallet } from 'lucide-react';
import { useUserStore, FinancialGoalItem } from '../store/userStore';

interface GoalContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoalItem | null;
}

export const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  isOpen,
  onClose,
  goal
}) => {
  const accounts = useUserStore((state) => state.accounts);
  const addGoalContribution = useUserStore((state) => state.addGoalContribution);

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && (!accountId || !accounts.some((a) => a.id === accountId))) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, isOpen]);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount.replace(',', '.'));

    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Por favor, informe um valor de aporte válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addGoalContribution(
        goal.id,
        amountVal,
        accountId || undefined,
        notes.trim() || `Aporte na meta ${goal.title}`,
        date
      );

      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Erro ao registrar aporte:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: goal.color || '#1E6B4B' }}
            >
              <PiggyBank className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Novo Aporte em Meta
              </h3>
              <p className="text-xs text-slate-400">
                Meta: <strong className="text-slate-700">{goal.title}</strong>
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
                Acumulado Atual
              </span>
              <span className="text-base font-extrabold text-slate-900">
                R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Faltam para o Objetivo
              </span>
              <span className="text-base font-extrabold text-[#1E6B4B]">
                R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Valor do Aporte */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Valor do Aporte (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Origem do Dinheiro (Conta Bancária - Opcional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Debitar da Conta (Opcional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer font-medium"
            >
              <option value="">Não debitar de conta (apenas registrar)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) - Saldo: R${' '}
                  {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Data do Aporte */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Data do Aporte *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Observação (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Sobra do salário, Rendimento extra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Footer Buttons */}
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
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/10 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Aporte'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
