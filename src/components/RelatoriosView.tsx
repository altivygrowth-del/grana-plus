import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { generateFinancialInsights, FinancialInsight } from '../services/financialInsights';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  Shield, 
  Target, 
  Trophy, 
  CreditCard,
  Lightbulb,
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export type PeriodFilter = 'this_month' | 'last_month' | 'last_3_months' | 'this_year';

// Color Palette for Category Charts matching Design System
const CATEGORY_COLORS: Record<string, string> = {
  'Moradia': '#1E6B4B',        // Deep Forest Emerald
  'Alimentação': '#2563EB',     // Royal Blue
  'Investimentos': '#8A05BE',   // Purple Nubank
  'Lazer': '#F59E0B',           // Warm Amber
  'Saúde': '#E11D48',           // Rose Red
  'Transporte': '#0EA5E9',      // Sky Blue
  'Educação': '#EC7000',        // Orange Itaú
  'Salário': '#10B981',         // Emerald Green
  'Freelance': '#3B82F6',       // Blue
  'Outros': '#64748B',          // Slate
};

const DEFAULT_PIE_COLORS = ['#1E6B4B', '#2563EB', '#F59E0B', '#8A05BE', '#E11D48', '#0EA5E9', '#EC7000', '#64748B'];

export const RelatoriosView: React.FC = () => {
  const { t } = useTranslation('reports');
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  
  const transactions = useUserStore((state) => state.transactions);
  const storeState = useUserStore();

  // ----------------------------------------------------
  // 1. FILTER TRANSACTIONS ACCORDING TO SELECTED PERIOD
  // ----------------------------------------------------
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Filter transactions from store
    const periodTxs = transactions.filter((t) => {
      if (!t.date) return true;
      const parts = t.date.split('-');
      if (parts.length < 3) return true;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed

      if (period === 'this_month') {
        return y === currentYear && m === currentMonth;
      }
      if (period === 'last_month') {
        const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
        return y === lastY && m === lastM;
      }
      if (period === 'last_3_months') {
        let mStart = currentMonth - 2;
        let yStart = currentYear;
        if (mStart < 0) {
          mStart += 12;
          yStart -= 1;
        }
        const txTime = new Date(y, m, 1).getTime();
        const startTime = new Date(yStart, mStart, 1).getTime();
        const endTime = new Date(currentYear, currentMonth + 1, 0).getTime();
        return txTime >= startTime && txTime <= endTime;
      }
      if (period === 'this_year') {
        return y === currentYear;
      }
      return true;
    });

    // Compute Income & Expenses
    const income = periodTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = periodTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = Math.max(0, income - expense);
    const savingsPercent = income > 0 ? Math.round((savings / income) * 100) : 0;
    const netBalance = income - expense;

    return {
      transactions: periodTxs,
      income,
      expense,
      savings,
      savingsPercent,
      netBalance,
    };
  }, [transactions, period]);

  // ----------------------------------------------------
  // 2. CATEGORY BREAKDOWN FOR DONUT CHART & RANKING
  // ----------------------------------------------------
  const categoryRanking = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};

    filteredData.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const totalExp = filteredData.expense || 1;

    // Convert to sorted array
    const sorted = Object.entries(expensesByCategory)
      .map(([category, value]) => ({
        category,
        value,
        percent: Math.round((value / totalExp) * 1000) / 10,
        color: CATEGORY_COLORS[category] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);

    return sorted;
  }, [filteredData]);

  // Donut chart dataset
  const donutData = useMemo(() => {
    return categoryRanking.map((item) => ({
      name: item.category,
      value: item.value,
      color: item.color,
    }));
  }, [categoryRanking]);

  // ----------------------------------------------------
  // 3. FINANCIAL EVOLUTION LINE CHART DATASET (DYNAMICAL FROM SUPABASE)
  // ----------------------------------------------------
  const evolutionChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    if (period === 'this_month') {
      const monthTxs = transactions.filter((t) => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        if (parts.length < 3) return false;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        return y === currentYear && m === currentMonth;
      });

      if (monthTxs.length === 0) return [];

      const dateMap: Record<string, { label: string; income: number; expense: number }> = {};

      monthTxs.forEach((t) => {
        const parts = t.date.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const label = `${String(d).padStart(2, '0')}/${monthNames[m - 1] || ''}`;

        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { label, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          dateMap[dateKey].income += t.amount;
        } else {
          dateMap[dateKey].expense += t.amount;
        }
      });

      const sortedKeys = Object.keys(dateMap).sort();
      let accIncome = 0;
      let accExpense = 0;

      return sortedKeys.map((key) => {
        const item = dateMap[key];
        accIncome += item.income;
        accExpense += item.expense;
        return {
          label: item.label,
          Entradas: Math.round(accIncome * 100) / 100,
          Saídas: Math.round(accExpense * 100) / 100,
          Saldo: Math.round((accIncome - accExpense) * 100) / 100,
        };
      });
    }

    if (period === 'last_month') {
      const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;

      const monthTxs = transactions.filter((t) => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        if (parts.length < 3) return false;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        return y === lastY && m === lastM;
      });

      if (monthTxs.length === 0) return [];

      const dateMap: Record<string, { label: string; income: number; expense: number }> = {};

      monthTxs.forEach((t) => {
        const parts = t.date.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const label = `${String(d).padStart(2, '0')}/${monthNames[m - 1] || ''}`;

        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { label, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          dateMap[dateKey].income += t.amount;
        } else {
          dateMap[dateKey].expense += t.amount;
        }
      });

      const sortedKeys = Object.keys(dateMap).sort();
      let accIncome = 0;
      let accExpense = 0;

      return sortedKeys.map((key) => {
        const item = dateMap[key];
        accIncome += item.income;
        accExpense += item.expense;
        return {
          label: item.label,
          Entradas: Math.round(accIncome * 100) / 100,
          Saídas: Math.round(accExpense * 100) / 100,
          Saldo: Math.round((accIncome - accExpense) * 100) / 100,
        };
      });
    }

    if (period === 'last_3_months') {
      const monthBuckets: { year: number; month: number; name: string }[] = [];
      const monthLongNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      for (let i = 2; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m < 0) {
          m += 12;
          y -= 1;
        }
        monthBuckets.push({ year: y, month: m, name: monthLongNames[m] });
      }

      let accIncome = 0;
      let accExpense = 0;
      let hasData = false;

      const result = monthBuckets.map((bucket) => {
        const monthTxs = transactions.filter((t) => {
          if (!t.date) return false;
          const parts = t.date.split('-');
          if (parts.length < 3) return false;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          return y === bucket.year && m === bucket.month;
        });

        if (monthTxs.length > 0) hasData = true;

        const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        accIncome += inc;
        accExpense += exp;

        return {
          label: bucket.name,
          Entradas: Math.round(inc * 100) / 100,
          Saídas: Math.round(exp * 100) / 100,
          Saldo: Math.round((accIncome - accExpense) * 100) / 100,
        };
      });

      if (!hasData) return [];
      return result;
    }

    if (period === 'this_year') {
      let accIncome = 0;
      let accExpense = 0;
      let hasData = false;

      const result = [];
      for (let m = 0; m <= currentMonth; m++) {
        const monthTxs = transactions.filter((t) => {
          if (!t.date) return false;
          const parts = t.date.split('-');
          if (parts.length < 3) return false;
          const y = parseInt(parts[0], 10);
          const mNum = parseInt(parts[1], 10) - 1;
          return y === currentYear && mNum === m;
        });

        if (monthTxs.length > 0) hasData = true;

        const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        accIncome += inc;
        accExpense += exp;

        result.push({
          label: monthNames[m],
          Entradas: Math.round(inc * 100) / 100,
          Saídas: Math.round(exp * 100) / 100,
          Saldo: Math.round((accIncome - accExpense) * 100) / 100,
        });
      }

      if (!hasData) return [];
      return result;
    }

    return [];
  }, [transactions, period]);

  // ----------------------------------------------------
  // 4. INTELLIGENT RESUME INSIGHTS (UP TO 3)
  // ----------------------------------------------------
  const topInsights = useMemo(() => {
    const all = generateFinancialInsights(storeState);
    return all.slice(0, 3);
  }, [storeState]);

  // Helper for Insight icon mapping
  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy;
      case 'AlertTriangle': return AlertTriangle;
      case 'TrendingUp': return TrendingUp;
      case 'CreditCard': return CreditCard;
      case 'CheckCircle2': return CheckCircle2;
      case 'Target': return Target;
      case 'Shield': return Shield;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24">
      
      {/* 1. SUPERIOR HEADER + FILTRO DE PERÍODO */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              {t('intelligence', 'Inteligência Financeira')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('title', 'Relatórios')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t('subtitle', 'Visão consolidada para entender e otimizar sua vida financeira rapidamente.')}
          </p>
        </div>

        {/* Filtro de Período Buttons */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex flex-wrap items-center gap-1 shrink-0">
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'this_month'
                ? 'bg-[#1E6B4B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {t('thisMonth', 'Este Mês')}
          </button>

          <button
            onClick={() => setPeriod('last_month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'last_month'
                ? 'bg-[#1E6B4B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {t('lastMonth', 'Mês Passado')}
          </button>

          <button
            onClick={() => setPeriod('last_3_months')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'last_3_months'
                ? 'bg-[#1E6B4B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {t('last3Months', 'Últimos 3 Meses')}
          </button>

          <button
            onClick={() => setPeriod('this_year')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === 'this_year'
                ? 'bg-[#1E6B4B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {t('thisYear', 'Este Ano')}
          </button>
        </div>
      </div>

      {/* 2. RESUMO - 4 CARDS CALCULADOS AUTOMATICAMENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Receitas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Receitas Totais
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1E6B4B]">
            R$ {filteredData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Entradas no período</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Despesas Totais
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600">
            R$ {filteredData.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Saídas e compromissos</span>
          </div>
        </div>

        {/* Economia */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Economia (Poupança)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <PiggyBank className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600">
            R$ {filteredData.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-semibold">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 text-[10px] font-extrabold">
              {filteredData.savingsPercent}% da receita
            </span>
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Saldo Líquido
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <Wallet className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold ${filteredData.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            R$ {filteredData.netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-normal">
            <span>Resultado financeiro livre</span>
          </div>
        </div>

      </div>

      {/* 3. GRÁFICOS: ROSCA (CATEGORIAS) E LINHAS (EVOLUÇÃO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO DE ROSCA - GASTOS POR CATEGORIA (5 colunas) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#1E6B4B]" />
                  <span>Gastos por Categoria</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribuição das despesas do período</p>
              </div>
            </div>

            {/* Donut Chart Container */}
            <div className="relative h-64 w-full my-2 flex items-center justify-center">
              {donutData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma despesa registrada para o período selecionado.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [
                        `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Gasto'
                      ]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '16px',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '10px 14px'
                      }}
                      itemStyle={{ color: '#4ADE80' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Donut Center Display */}
              {donutData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Gastos
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    R$ {filteredData.expense.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Legend Tags */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-2">
            {donutData.slice(0, 5).map((item) => (
              <div key={`legend-${item.name}`} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-700">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO DE LINHAS - EVOLUÇÃO FINANCEIRA (7 colunas) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LineIcon className="w-4 h-4 text-[#1E6B4B]" />
                  <span>Evolução Financeira</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Comparativo temporal de Entradas, Saídas e Saldo</p>
              </div>

              {/* Line Legend */}
              <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E6B4B]" />
                  <span className="text-slate-600">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600">Saídas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-slate-600">Saldo</span>
                </div>
              </div>
            </div>

            {/* Line Chart Container */}
            <div className="h-64 w-full my-2">
              {evolutionChartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs py-12">
                  <LineIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <span>Nenhum dado de movimentação para o período selecionado.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                      tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '16px',
                        color: '#FFF',
                        fontSize: '11px',
                        padding: '10px 14px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Entradas" 
                      stroke="#1E6B4B" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#1E6B4B' }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Saídas" 
                      stroke="#F43F5E" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#F43F5E' }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Saldo" 
                      stroke="#2563EB" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#2563EB' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 5. CATEGORIAS COM MAIOR GASTO (RANKING MAIOR PARA MENOR) */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E6B4B]" />
              <span>Categorias com Maior Gasto</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ranking ordenado por valor acumulado no período</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
            {categoryRanking.length} Categorias
          </span>
        </div>

        {categoryRanking.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhum gasto registrado no período para exibição no ranking.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {categoryRanking.map((item, index) => (
              <div key={`ranking-${item.category}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}º
                    </span>
                    <span className="text-slate-800">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-900">
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 font-semibold text-[11px] min-w-[45px] text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, item.percent)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. RESUMO INTELIGENTE - CARD FINAL COM ATÉ 3 INSIGHTS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#165037] rounded-[28px] p-6 lg:p-8 text-white shadow-xl relative overflow-hidden space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Resumo Inteligente Grana+</h3>
              <p className="text-xs text-emerald-200/80">
                Análise proativa de padrões e recomendações para seu momento financeiro
              </p>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider hidden sm:inline-block">
            IA Financeira
          </span>
        </div>

        {/* List of Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {topInsights.map((insight) => {
            const IconComp = getInsightIcon(insight.icone);

            let tagBg = 'bg-slate-700 text-slate-200';
            if (insight.prioridade === 'alta') tagBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            else if (insight.prioridade === 'media') tagBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            else tagBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

            return (
              <div 
                key={insight.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-600 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tagBg} uppercase`}>
                      {insight.prioridade}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {insight.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {insight.descricao}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 text-[10px] font-medium text-emerald-300 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{insight.acaoSugerida}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
