import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Trash2 } from 'lucide-react';
import { CreditCardItem } from '../store/userStore';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Omit<CreditCardItem, 'id' | 'currentUsage'> & { currentUsage?: number }, id?: string) => void;
  onDelete?: (id: string) => void;
  editingCard?: CreditCardItem | null;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCard
}) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [brand, setBrand] = useState('Mastercard');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [totalLimit, setTotalLimit] = useState('');
  const [closingDate, setClosingDate] = useState('Dia 05');
  const [dueDate, setDueDate] = useState('Dia 12');

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name || '');
      setBank(editingCard.bank || '');
      setBrand(editingCard.brand || 'Mastercard');
      setLastFourDigits(editingCard.lastFourDigits || '');
      setTotalLimit(editingCard.totalLimit ? String(editingCard.totalLimit) : '');
      setClosingDate(editingCard.closingDate || 'Dia 05');
      setDueDate(editingCard.dueDate || 'Dia 12');
    } else {
      setName('');
      setBank('');
      setBrand('Mastercard');
      setLastFourDigits('');
      setTotalLimit('');
      setClosingDate('Dia 05');
      setDueDate('Dia 12');
    }
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(totalLimit.replace(',', '.'));
    if (!name.trim() || isNaN(parsedLimit) || parsedLimit <= 0) return;

    onSave({
      name: name.trim(),
      bank,
      brand,
      lastFourDigits: lastFourDigits.slice(-4) || undefined,
      totalLimit: parsedLimit,
      closingDate: closingDate.trim() || 'Dia 05',
      dueDate: dueDate.trim() || 'Dia 12',
      currentUsage: editingCard ? editingCard.currentUsage : 0,
      color: editingCard?.color || (bank === 'Nubank' ? '#8A05BE' : bank === 'Itaú' ? '#EC7000' : '#165037')
    }, editingCard?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {editingCard ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
              </h3>
              <p className="text-xs text-slate-400">
                Informe os detalhes do cartão para gestão de limite e faturas
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
          
          {/* Nome do Cartão */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nome do Cartão <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank Ultravioleta, Itaú Personalité..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Banco & Bandeira */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Banco Emissor
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
              >
                <option value="Nubank">Nubank</option>
                <option value="Itaú">Itaú</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Banco Inter">Banco Inter</option>
                <option value="Santander">Santander</option>
                <option value="C6 Bank">C6 Bank</option>
                <option value="BTG Pactual">BTG Pactual</option>
                <option value="XP Investimentos">XP Investimentos</option>
                <option value="Caixa">Caixa</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bandeira
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
              >
                <option value="Mastercard">Mastercard</option>
                <option value="Visa">Visa</option>
                <option value="Elo">Elo</option>
                <option value="Amex">American Express</option>
                <option value="Hipercard">Hipercard</option>
              </select>
            </div>
          </div>

          {/* Limite & Últimos 4 Dígitos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Limite Total (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="5000,00"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Últimos 4 Dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="8842"
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Fechamento & Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Data de Fechamento
              </label>
              <input
                type="text"
                placeholder="Ex: Dia 05 ou 05/08"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Data de Vencimento
              </label>
              <input
                type="text"
                placeholder="Ex: Dia 12 ou 12/08"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-6">
            {editingCard && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir o cartão "${editingCard.name}"?`)) {
                    onDelete(editingCard.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/10"
              >
                <Check className="w-4 h-4" />
                {editingCard ? 'Salvar Alterações' : 'Cadastrar Cartão'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
