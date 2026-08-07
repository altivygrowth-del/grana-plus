import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore, CreditCardItem } from '../store/userStore';
import { CardModal } from './CardModal';
import { CardPurchaseModal } from './CardPurchaseModal';
import { PayInvoiceModal } from './PayInvoiceModal';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  ShoppingBag,
  ArrowDownRight,
  ArrowUpDown,
  Wallet
} from 'lucide-react';

export const CartoesView: React.FC = () => {
  const { t } = useTranslation('cards');
  const cards = useUserStore((state) => state.cards);
  const isLoadingCards = useUserStore((state) => state.isLoadingCards);
  const createCard = useUserStore((state) => state.createCard);
  const updateCard = useUserStore((state) => state.updateCard);
  const deleteCard = useUserStore((state) => state.deleteCard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPayInvoiceModalOpen, setIsPayInvoiceModalOpen] = useState(false);
  
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);
  const [selectedPayCard, setSelectedPayCard] = useState<CreditCardItem | null>(null);
  const [purchaseCardId, setPurchaseCardId] = useState<string | undefined>(undefined);

  const [sortBy, setSortBy] = useState<'name' | 'limit'>('limit');

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: CreditCardItem) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleOpenPurchaseModal = (cardId?: string) => {
    setPurchaseCardId(cardId);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenPayInvoiceModal = (card: CreditCardItem) => {
    setSelectedPayCard(card);
    setIsPayInvoiceModalOpen(true);
  };

  const handleSaveCard = async (
    cardData: Omit<CreditCardItem, 'id' | 'currentUsage'> & { currentUsage?: number },
    id?: string
  ) => {
    if (id) {
      await updateCard(id, cardData);
    } else {
      await createCard(cardData);
    }
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
  };

  // Sort cards automatically
  const sortedCards = [...cards].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.totalLimit - a.totalLimit;
  });

  // Aggregated card stats
  const totalLimitAll = cards.reduce((sum, c) => sum + c.totalLimit, 0);
  const totalUsageAll = cards.reduce((sum, c) => sum + c.currentUsage, 0);
  const totalAvailableAll = Math.max(0, totalLimitAll - totalUsageAll);

  // Brand badge helper
  const getBrandBadge = (brand?: string) => {
    const b = (brand || 'Mastercard').toLowerCase();
    if (b.includes('visa')) return { bg: 'bg-blue-600 text-white', label: 'VISA' };
    if (b.includes('master')) return { bg: 'bg-rose-600 text-white', label: 'Mastercard' };
    if (b.includes('elo')) return { bg: 'bg-black text-white', label: 'ELO' };
    if (b.includes('amex') || b.includes('american')) return { bg: 'bg-emerald-600 text-white', label: 'AMEX' };
    return { bg: 'bg-slate-800 text-white', label: brand || 'Cartão' };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              {t('creditManagement', 'Gestão de Crédito')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('title', 'Cartões')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t('subtitle', 'Gerencie seus cartões, limite e faturas integrados.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {cards.length > 0 && (
            <button
              onClick={() => handleOpenPurchaseModal()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-500/10 shrink-0"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>+ {t('newPurchase', 'Nova Compra')}</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/10 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ {t('addCard', 'Novo Cartão')}</span>
          </button>
        </div>
      </div>

      {/* INDICADORES GERAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Limite Total Acumulado
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            R$ {totalLimitAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soma dos limites de todos os cartões
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Utilizado (Faturas)
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600">
            R$ {totalUsageAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Comprometimento atual do limite
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Limite Livre Disponível
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1E6B4B]">
            R$ {totalAvailableAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pronto para uso com segurança
          </p>
        </div>
      </div>

      {/* 2. CARDS DOS CARTÕES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Meus Cartões Cadastrados</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full">
              {cards.length}
            </span>
          </h2>

          {cards.length > 1 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'limit')}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20"
              >
                <option value="limit">Maior Limite</option>
                <option value="name">Nome (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* LOADING SKELETON */}
        {isLoadingCards ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-[28px] p-6 border border-slate-100 space-y-4 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1E6B4B] flex items-center justify-center mx-auto border border-emerald-100">
              <CreditCard className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Você ainda não possui cartões cadastrados.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-normal">
                Cadastre seus cartões reais de crédito para acompanhar faturas, gerenciar limites e registrar compras parceladas automaticamente.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E6B4B] text-white text-xs font-bold hover:bg-[#165037] transition-all cursor-pointer shadow-md shadow-emerald-900/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar primeiro cartão</span>
            </button>
          </div>
        ) : (
          /* GRID DE CARTÕES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map((card) => {
              const available = Math.max(0, card.totalLimit - card.currentUsage);
              const usagePercent = card.totalLimit > 0 ? Math.min(100, Math.round((card.currentUsage / card.totalLimit) * 100)) : 0;
              const brandInfo = getBrandBadge(card.brand);

              // Usage status bar color
              let progressColor = 'bg-[#1E6B4B]';
              if (usagePercent >= 80) progressColor = 'bg-rose-500';
              else if (usagePercent >= 50) progressColor = 'bg-amber-500';

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] relative group"
                >
                  <div>
                    {/* Header: Nome + Banco + Bandeira & Digits */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {card.bank || 'Banco'}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#1E6B4B] transition-colors">
                          {card.name}
                        </h3>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${brandInfo.bg}`}>
                          {brandInfo.label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          •••• {card.lastFourDigits || '4321'}
                        </span>
                      </div>
                    </div>

                    {/* Credit Visual Bar */}
                    <div className="space-y-1.5 my-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Uso do Limite</span>
                        <span className={usagePercent >= 80 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
                          {usagePercent}%
                        </span>
                      </div>
                      
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Limits breakdown */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center my-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Limite Total
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          R$ {card.totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Utilizado
                        </span>
                        <span className="text-xs font-bold text-amber-600">
                          R$ {card.currentUsage.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Disponível
                        </span>
                        <span className="text-xs font-bold text-[#1E6B4B]">
                          R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Datas de Fechamento e Vencimento */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium">Fechamento</span>
                          <span className="font-bold text-slate-700 text-[11px]">{card.closingDate || 'Dia 05'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium">Vencimento</span>
                          <span className="font-bold text-slate-800 text-[11px]">{card.dueDate || 'Dia 12'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100/80 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenPurchaseModal(card.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Nova Compra</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(card)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#1E6B4B] hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o cartão "${card.name}"?`)) {
                            handleDeleteCard(card.id);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PRÓXIMAS FATURAS */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1E6B4B]" />
              <span>Próximas Faturas</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe o vencimento, o valor atual das faturas e realize o pagamento com um clique
            </p>
          </div>
        </div>

        {cards.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Cadastre um cartão para visualizar as próximas faturas.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {cards.map((card) => {
              const invoiceStatus = card.currentUsage > 0 ? 'Fatura Aberta' : 'Fatura Zerada';
              const statusBg = card.currentUsage > 0 
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-[#1E6B4B] border-emerald-200';

              return (
                <div key={`invoice-${card.id}`} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {card.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Fechamento: <strong className="text-slate-700">{card.closingDate || 'Dia 05'}</strong></span>
                        <span>•</span>
                        <span>Vencimento: <strong className="text-slate-700">{card.dueDate || 'Dia 12'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                        R$ {card.currentUsage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${statusBg}`}>
                        {invoiceStatus}
                      </span>
                    </div>

                    {card.currentUsage > 0 && (
                      <button
                        onClick={() => handleOpenPayInvoiceModal(card)}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Pagar Fatura</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Cartão */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        editingCard={editingCard}
      />

      {/* Modal Nova Compra no Cartão */}
      <CardPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        defaultCardId={purchaseCardId}
      />

      {/* Modal Pagar Fatura */}
      <PayInvoiceModal
        isOpen={isPayInvoiceModalOpen}
        onClose={() => setIsPayInvoiceModalOpen(false)}
        card={selectedPayCard}
      />

    </div>
  );
};
