import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDate } from '../lib/formatters';
import { TransactionType } from '../types/financial';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { 
    transactions, 
    deleteTransaction, 
    searchQuery, 
    selectedCategory,
    setSelectedCategory,
    categoriesList,
    setIsAddModalOpen
  } = useFinancial();

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const sortedAndFiltered = [...transactions]
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date.includes('T') ? a.date : `${a.date}T12:00:00`).getTime() : 0;
      const timeB = b.date ? new Date(b.date.includes('T') ? b.date : `${b.date}T12:00:00`).getTime() : 0;
      return timeB - timeA;
    })
    .filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });

  const displayTransactions = sortedAndFiltered.slice(0, 10);

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
            TIMELINE
          </span>
          <h3 className="text-base font-semibold text-slate-900 mt-1">Últimas Movimentações</h3>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type tabs */}
          <div className="flex bg-slate-100 p-1 rounded-full text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Saídas
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative flex items-center bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Todas Categorias</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {displayTransactions.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-600">Nenhuma movimentação encontrada</p>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou registre um novo lançamento.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 text-xs bg-[#FF7034] text-white font-bold px-4 py-2 rounded-full hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Novo Lançamento
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Lançamento & Data</th>
                <th className="py-3 px-2">Categoria</th>
                <th className="py-3 px-2">Método</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Valor</th>
                <th className="py-3 px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTransactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr 
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Description & Date */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-100 text-[#4CAF6A]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#1E6B4B] transition-colors">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {formatDate(tx.date)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-2 text-slate-500 font-normal">
                      {tx.paymentMethod || 'Pix'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2">
                      {tx.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[#4CAF6A] text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Concluído
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Pendente
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-2 text-right font-bold text-sm">
                      <span className={isIncome ? 'text-[#4CAF6A]' : 'text-slate-900'}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Excluir Lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

