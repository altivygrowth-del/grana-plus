import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { TransactionCategory } from '../types/financial';
import { transactionsService } from '../services/transactions/transactions.service';

interface CardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCardId?: string;
}

const CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Outros'
];

export const CardPurchaseModal: React.FC<CardPurchaseModalProps> = ({
  isOpen,
  onClose,
  defaultCardId
}) => {
  const cards = useUserStore((state) => state.cards);
  const updateCard = useUserStore((state) => state.updateCard);
  const fetchTransactions = useUserStore((state) => state.fetchTransactions);

  const [cardId, setCardId] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultCardId) {
      setCardId(defaultCardId);
    } else if (cards.length > 0 && (!cardId || !cards.some((c) => c.id === cardId))) {
      setCardId(cards[0].id);
    }
  }, [defaultCardId, cards, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(amount.replace(',', '.'));
    const numInstallments = parseInt(installments, 10) || 1;
    const selectedCard = cards.find((c) => c.id === cardId);

    if (!selectedCard || isNaN(totalAmount) || totalAmount <= 0 || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const installmentValue = Math.round((totalAmount / numInstallments) * 100) / 100;
      const [year, month, day] = date.split('-').map(Number);

      // Create N installment transactions in Supabase
      for (let i = 1; i <= numInstallments; i++) {
        const instDate = new Date(year, month - 1 + (i - 1), day);
        const dateStr = instDate.toISOString().split('T')[0];

        const txDesc = numInstallments > 1
          ? `${description.trim()} (${i}/${numInstallments})`
          : description.trim();

        await transactionsService.createTransaction({
          description: txDesc,
          amount: installmentValue,
          type: 'expense',
          category,
          date: dateStr,
          status: i === 1 ? 'completed' : 'pending',
          paymentMethod: 'Cartão de Crédito',
          notes: notes.trim() ? `${notes.trim()} - Parcela ${i}/${numInstallments}` : `Compra no cartão ${selectedCard.name}`
        });
      }

      // Update card used limit in Supabase & Zustand store
      const newUsage = (selectedCard.currentUsage || 0) + totalAmount;
      await updateCard(selectedCard.id, { currentUsage: newUsage });

      // Refresh transactions in store
      await fetchTransactions();

      // Reset form and close
      setDescription('');
      setAmount('');
      setInstallments('1');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Erro ao registrar compra no cartão:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF7034] flex items-center justify-center border border-orange-100 shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Nova Compra no Cartão
              </h3>
              <p className="text-xs text-slate-400">
                Registre um gasto e gere parcelas automaticamente
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
          
          {/* Cartão de Crédito */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cartão de Crédito <span className="text-rose-500">*</span>
            </label>
            <select
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer font-medium"
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.bank || 'Banco'}) - Limite disponível: R${' '}
                  {Math.max(0, card.totalLimit - card.currentUsage).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Descrição da Compra <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Passagem Aérea, Smartphone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Valor Total & Parcelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Valor Total (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Número de Parcelas
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer font-medium"
              >
                <option value="1">1x À vista (sem parcelar)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
                <option value="10">10x</option>
                <option value="12">12x</option>
                <option value="18">18x</option>
                <option value="24">24x</option>
              </select>
            </div>
          </div>

          {/* Categoria & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Data da Compra
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observação (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Compra realizada no shopping"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Installment preview hint */}
          {parseInt(installments, 10) > 1 && parseFloat(amount) > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-xs text-orange-900 flex items-center justify-between">
              <span>Valor por parcela:</span>
              <strong className="font-extrabold text-orange-700">
                {installments}x de R${' '}
                {(parseFloat(amount) / parseInt(installments, 10)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          )}

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
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF7034] hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Compra'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
