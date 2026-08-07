import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { TransactionType, TransactionCategory } from '../types/financial';
import { X, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addTransaction, categoriesList } = useFinancial();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão de Crédito' | 'Débito' | 'Boleto' | 'Dinheiro'>('Pix');

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    addTransaction({
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      date,
      status: 'completed',
      paymentMethod,
    });

    setDescription('');
    setAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Novo Lançamento</h3>
            <p className="text-xs text-slate-400">Registre uma nova movimentação financeira</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Selector Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-full">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Alimentação');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Saída (Despesa)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salário');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#4CAF6A] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Entrada (Receita)
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Descrição do Lançamento
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado, Aluguel, Prolabore..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Valor (R$)
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
                Data
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

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Débito">Débito</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF7034] hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Check className="w-4 h-4" />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

