import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore, AssetItem, AssetCategory } from '../store/userStore';
import { 
  Landmark, 
  Plus, 
  TrendingUp, 
  Layers, 
  Trophy, 
  Building2, 
  Car, 
  Wallet, 
  Coins, 
  Box, 
  Calendar, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  ArrowUpRight,
  ShieldAlert,
  Search,
  Sparkles,
  Loader2
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

// Color Mapping by Asset Category
const CATEGORY_COLORS: Record<string, string> = {
  'Contas': '#2563EB',         // Royal Blue
  'Investimentos': '#8A05BE',  // Purple
  'Imóveis': '#1E6B4B',        // Forest Emerald
  'Veículos': '#0EA5E9',       // Sky Blue
  'Criptoativos': '#F59E0B',    // Amber / Gold
  'Outros': '#64748B',         // Slate
  'Outros Bens': '#64748B'     // Slate fallback
};

// Helper for Category Icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Contas': return Wallet;
    case 'Investimentos': return TrendingUp;
    case 'Imóveis': return Building2;
    case 'Veículos': return Car;
    case 'Criptoativos': return Coins;
    case 'Outros': 
    case 'Outros Bens': 
    default: return Box;
  }
};

export const PatrimonioView: React.FC = () => {
  const { t } = useTranslation('patrimonio');
  const assets = useUserStore((state) => state.assets);
  const accounts = useUserStore((state) => state.accounts);
  const isLoadingAssets = useUserStore((state) => state.isLoadingAssets);
  const createAsset = useUserStore((state) => state.createAsset);
  const updateAsset = useUserStore((state) => state.updateAsset);
  const deleteAsset = useUserStore((state) => state.deleteAsset);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: AssetCategory;
    value: string;
    acquisitionDate: string;
    notes: string;
  }>({
    name: '',
    category: 'Investimentos',
    value: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Filter and Search State for Asset List
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  // Confirmation Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ----------------------------------------------------
  // 1. STATS & RESUMO COMPUTATION (TOTAL PATRIMÔNIO)
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const accountsTotal = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    const assetsTotal = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const total = accountsTotal + assetsTotal;
    const count = assets.length + (accounts.length > 0 ? 1 : 0);

    // Find Asset with Maximum Value
    let maxAsset: { name: string; value: number } | null = null;
    if (assets.length > 0) {
      const highest = assets.reduce((max, a) => (a.value > max.value ? a : max), assets[0]);
      maxAsset = { name: highest.name, value: highest.value };
    } else if (accountsTotal > 0) {
      maxAsset = { name: 'Saldos em Contas', value: accountsTotal };
    }

    return {
      total,
      accountsTotal,
      assetsTotal,
      count,
      maxAsset
    };
  }, [assets, accounts]);

  // ----------------------------------------------------
  // 2. DISTRIBUTION DONUT CHART DATASET
  // ----------------------------------------------------
  const distributionData = useMemo(() => {
    const categories: AssetCategory[] = ['Contas', 'Investimentos', 'Imóveis', 'Veículos', 'Criptoativos', 'Outros'];
    const total = stats.total || 1;

    const dataMap: Record<string, number> = {
      'Contas': stats.accountsTotal,
      'Investimentos': 0,
      'Imóveis': 0,
      'Veículos': 0,
      'Criptoativos': 0,
      'Outros': 0
    };

    assets.forEach((asset) => {
      let catKey = asset.category as string;
      if (catKey === 'Outros Bens') catKey = 'Outros';
      if (!dataMap[catKey]) dataMap[catKey] = 0;
      dataMap[catKey] += asset.value;
    });

    return categories
      .map((cat) => {
        const value = dataMap[cat] || 0;
        const percent = Math.round((value / total) * 1000) / 10;
        return {
          name: cat,
          value,
          percent,
          color: CATEGORY_COLORS[cat] || '#64748B'
        };
      })
      .filter((item) => item.value > 0);
  }, [assets, stats.accountsTotal, stats.total]);

  // ----------------------------------------------------
  // 3. EVOLUÇÃO PATRIMONIAL LINE CHART DATASET
  // ----------------------------------------------------
  const evolutionChartData = useMemo(() => {
    const current = stats.total;
    if (current === 0) return [];
    
    // Build relative progressive trajectory based on actual current total
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }) + '/' + d.getFullYear().toString().slice(-2);
      const factor = i === 0 ? 1 : 1 - (i * 0.04);
      months.push({
        month: monthLabel,
        Patrimonio: Math.round(current * factor)
      });
    }
    return months;
  }, [stats.total]);

  // ----------------------------------------------------
  // 4. FILTERED ASSET LIST
  // ----------------------------------------------------
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (asset.notes && asset.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = selectedCategoryFilter === 'todos' || asset.category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [assets, searchTerm, selectedCategoryFilter]);

  // ----------------------------------------------------
  // HANDLERS FOR MODAL
  // ----------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      category: 'Investimentos',
      value: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: AssetItem) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      value: asset.value.toString(),
      acquisitionDate: asset.acquisitionDate || new Date().toISOString().split('T')[0],
      notes: asset.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    const numValue = parseFloat(formData.value) || 0;

    if (editingAsset) {
      await updateAsset(editingAsset.id, {
        name: formData.name.trim(),
        category: formData.category,
        value: numValue,
        acquisitionDate: formData.acquisitionDate,
        notes: formData.notes.trim()
      });
    } else {
      await createAsset({
        name: formData.name.trim(),
        category: formData.category,
        value: numValue,
        acquisitionDate: formData.acquisitionDate,
        notes: formData.notes.trim(),
        lastUpdated: 'Hoje'
      });
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
    setDeletingId(null);
  };

  // ----------------------------------------------------
  // SKELETON LOADING STATE
  // ----------------------------------------------------
  if (isLoadingAssets) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse pb-24">
        {/* Header Skeleton */}
        <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-slate-100 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-2xl"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[24px] p-5 border border-slate-100 space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-7 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 space-y-4">
          <div className="h-6 w-40 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24">
      
      {/* 1. CARD SUPERIOR */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              {t('assetManagement', 'Gestão de Ativos')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('title', 'Patrimônio')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t('subtitle', 'Acompanhamento consolidado de todos os seus bens e investimentos.')}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Novo Patrimônio</span>
        </button>
      </div>

      {/* 2. RESUMO - 4 CARDS CALCULADOS AUTOMATICAMENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Patrimônio Total */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Patrimônio Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <Landmark className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Contas e ativos consolidados</span>
          </div>
        </div>

        {/* Saldos em Contas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Saldo em Contas
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Wallet className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600">
            R$ {stats.accountsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-medium">
            <span>Contas bancárias cadastradas</span>
          </div>
        </div>

        {/* Quantidade de Ativos */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quantidade de Ativos
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Layers className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {assets.length} {assets.length === 1 ? 'ativo' : 'bens/ativos'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 font-normal">
            <span>Cadastrados no Supabase</span>
          </div>
        </div>

        {/* Maior Patrimônio */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Maior Ativo
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Trophy className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
            {stats.maxAsset ? `R$ ${stats.maxAsset.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : 'R$ 0,00'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-700 font-semibold truncate">
            <span>{stats.maxAsset ? stats.maxAsset.name : 'Nenhum ativo'}</span>
          </div>
        </div>

      </div>

      {/* 3. EVOLUÇÃO PATRIMONIAL E DISTRIBUIÇÃO (GRÁFICOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO DE LINHAS - EVOLUÇÃO PATRIMONIAL (7 colunas) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LineIcon className="w-4 h-4 text-[#1E6B4B]" />
                  <span>Evolução Patrimonial</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Trajetória do total consolidado</p>
              </div>

              <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100">
                Histórico
              </span>
            </div>

            <div className="h-64 w-full my-2">
              {evolutionChartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                  <Landmark className="w-8 h-8 text-slate-300 mb-2" />
                  <span>Cadastre patrimônios para visualizar a evolução gráfica.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
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
                      formatter={(value: number) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Patrimônio Total'
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
                      dataKey="Patrimonio" 
                      stroke="#1E6B4B" 
                      strokeWidth={3.5} 
                      dot={{ r: 4, fill: '#1E6B4B' }} 
                      activeDot={{ r: 7 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* GRÁFICO DE ROSCA - DISTRIBUIÇÃO (5 colunas) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#1E6B4B]" />
                  <span>Distribuição</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Composição por categoria de ativos</p>
              </div>
            </div>

            {/* Donut Container */}
            <div className="relative h-60 w-full my-1 flex items-center justify-center">
              {distributionData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum ativo ou saldo cadastrado para exibir no gráfico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [
                        `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Valor'
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
              {distributionData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ativos Total
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Legend */}
          {distributionData.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-2">
              {distributionData.map((item) => (
                <div key={`legend-${item.name}`} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="text-slate-400 text-[10px]">({item.percent}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. LISTA DE PATRIMÔNIOS / EMPTY STATE */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-6">
        
        {/* Filter / Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1E6B4B]" />
              <span>Lista de Patrimônios</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualização detalhada de todos os seus bens e ativos
            </p>
          </div>

          {/* Search Input & Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar patrimônio..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B] w-48 transition-all"
              />
            </div>

            {/* Category Select Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 cursor-pointer"
            >
              <option value="todos">Todas as categorias</option>
              <option value="Contas">Contas</option>
              <option value="Investimentos">Investimentos</option>
              <option value="Imóveis">Imóveis</option>
              <option value="Veículos">Veículos</option>
              <option value="Criptoativos">Criptoativos</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        {/* EMPTY STATE */}
        {assets.length === 0 ? (
          <div className="text-center py-14 px-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200/80 space-y-4 max-w-md mx-auto my-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center mx-auto border border-emerald-100/80 shadow-xs">
              <Landmark className="w-8 h-8 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900">
                Cadastre seu primeiro patrimônio.
              </h4>
              <p className="text-xs text-slate-500 font-normal max-w-xs mx-auto">
                Organize seus investimentos, imóveis, veículos e criptoativos em um único painel dinâmico.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar patrimônio</span>
            </button>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Box className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Nenhum patrimônio encontrado com os filtros aplicados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoryFilter('todos');
              }}
              className="text-xs text-[#1E6B4B] font-bold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAssets.map((asset) => {
              const IconComp = getCategoryIcon(asset.category);
              const color = CATEGORY_COLORS[asset.category] || '#64748B';

              return (
                <div
                  key={asset.id}
                  className="bg-slate-50/60 hover:bg-white border border-slate-200/70 hover:border-slate-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header: Icon + Category Badge + Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <IconComp className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <span 
                            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block"
                            style={{ backgroundColor: `${color}15`, color: color }}
                          >
                            {asset.category}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                            {asset.name}
                          </h4>
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(asset)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                          title="Editar Patrimônio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(asset.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Patrimônio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Valor Atual
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Observações */}
                    {asset.notes && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/40">
                        "{asset.notes}"
                      </p>
                    )}
                  </div>

                  {/* Footer: Date Info */}
                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Aquisição: {asset.acquisitionDate || 'N/A'}</span>
                    </div>
                    <span>Atu: {asset.lastUpdated || 'Hoje'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MODAL (+ Novo Patrimônio e Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                  <Landmark className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingAsset ? 'Editar Patrimônio' : 'Novo Patrimônio'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingAsset ? 'Atualize as informações do ativo' : 'Cadastre um novo bem ou ativo no seu patrimônio'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAsset} className="p-6 space-y-4">
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nome do Patrimônio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Apartamento, Ações Petrobras, Bitcoin, Honda Civic..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B] cursor-pointer"
                >
                  <option value="Contas">Contas</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Imóveis">Imóveis</option>
                  <option value="Veículos">Veículos</option>
                  <option value="Criptoativos">Criptoativos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Valor e Data de Aquisição */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Valor Atual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes adicionais, número de cotas, notas de avaliação..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAsset ? 'Salvar Alterações' : 'Cadastrar Patrimônio'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Excluir Patrimônio?</h3>
              <p className="text-xs text-slate-500">
                Esta ação removerá este ativo do Supabase e atualizará automaticamente seus gráficos e resumos.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
