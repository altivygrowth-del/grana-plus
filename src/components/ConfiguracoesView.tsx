import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useUserStore } from '../store/userStore';
import { 
  User, 
  Settings, 
  Globe, 
  DollarSign, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Trash2, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  X, 
  Crown, 
  ChevronRight,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const { t } = useTranslation('settings');
  const user = useUserStore((state) => state.user);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const transactions = useUserStore((state) => state.transactions);
  const accounts = useUserStore((state) => state.accounts);
  const goals = useUserStore((state) => state.goals);
  const cards = useUserStore((state) => state.cards);

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editEmail, setEditEmail] = useState(user.email || '');

  // Interactive feedback messages (toast simulation)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
    });
    setIsEditProfileOpen(false);
    showToast('Perfil atualizado com sucesso!');
  };

  const handleLanguageChange = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('grana_language', newLang);
    updateProfile({ language: newLang });
    showToast(`Idioma alterado para: ${newLang}`);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    localStorage.setItem('grana_currency', newCurrency);
    updateProfile({ currency: newCurrency });
    showToast(`Moeda principal alterada para: ${newCurrency}`);
  };

  const handleNotificationToggle = (key: 'reminders' | 'insights' | 'updates') => {
    const current = user.notifications || { reminders: true, insights: true, updates: false };
    const updated = {
      ...current,
      [key]: !current[key],
    };
    updateProfile({ notifications: updated });
    showToast('Preferências de notificação salvas!');
  };

  // Data Export
  const handleExportData = () => {
    const exportPayload = {
      userProfile: user,
      accounts,
      transactions,
      goals,
      cards,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `grana_plus_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Dados exportados com sucesso em arquivo JSON!');
  };

  // Data Import (Simulated)
  const handleImportData = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        showToast(`Arquivo "${file.name}" importado com sucesso!`);
      }
    };
    fileInput.click();
  };

  // Initials for avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GR';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER / TITULO */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Central de Ajustes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Configurações
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Personalize seu perfil, preferências, notificações e dados da sua conta.
          </p>
        </div>
      </div>

      {/* 2. CARD DO PERFIL */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
          {/* Avatar com iniciais */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1E6B4B] to-[#165037] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-emerald-900/10 border-2 border-white shrink-0 relative">
            {initials}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {user.name}
              </h2>
              <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                Gratuito
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {user.email || 'E-mail não informado'}
            </p>
            <p className="text-[11px] text-slate-400">
              Membro do Grana+ desde 2026
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditName(user.name);
            setEditEmail(user.email || '');
            setIsEditProfileOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#1E6B4B]" />
          <span>Editar Perfil</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. PREFERÊNCIAS */}
        <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <Settings className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Preferências</h3>
              <p className="text-xs text-slate-400">Aparência e formatos de exibição do sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Idioma */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Idioma</span>
                  <span className="text-[11px] text-slate-400">Idioma da interface</span>
                </div>
              </div>
              <select
                value={i18n.language || user.language || 'pt-BR'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs font-bold text-[#1E6B4B] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/60 outline-none cursor-pointer"
              >
                <option value="pt-BR">Português (pt-BR)</option>
                <option value="en-US">English (en-US)</option>
                <option value="es-ES">Español (es-ES)</option>
              </select>
            </div>

            {/* Moeda */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Moeda Principal</span>
                  <span className="text-[11px] text-slate-400">Padrão financeiro</span>
                </div>
              </div>
              <select
                value={localStorage.getItem('grana_currency') || user.currency || 'BRL'}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="text-xs font-bold text-[#1E6B4B] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/60 outline-none cursor-pointer"
              >
                <option value="BRL">Real (BRL - R$)</option>
                <option value="USD">Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
              </select>
            </div>

            {/* Formato de Data */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Formato de Data</span>
                  <span className="text-[11px] text-slate-400">Exibição de prazos</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                DD/MM/AAAA
              </span>
            </div>
          </div>
        </div>

        {/* 4. NOTIFICAÇÕES */}
        <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <Bell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Notificações</h3>
              <p className="text-xs text-slate-400">Configure os avisos e lembretes que deseja receber</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Lembretes */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Lembretes de Contas</span>
                <p className="text-[11px] text-slate-400">Alertas de faturas e vencimentos de metas</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('reminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  (user.notifications?.reminders ?? true) ? 'bg-[#1E6B4B]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (user.notifications?.reminders ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Insights Financeiros */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Insights Financeiros</span>
                <p className="text-[11px] text-slate-400">Notificações da IA quando identificar padrões</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('insights')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  (user.notifications?.insights ?? true) ? 'bg-[#1E6B4B]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (user.notifications?.insights ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Atualizações */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Atualizações de Recursos</span>
                <p className="text-[11px] text-slate-400">Novidades e melhorias do Grana+</p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle('updates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  (user.notifications?.updates ?? false) ? 'bg-[#1E6B4B]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (user.notifications?.updates ?? false) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5. SEGURANÇA */}
        <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Segurança</h3>
              <p className="text-xs text-slate-400">Gerenciamento de credenciais e privacidade</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => showToast('Solicitação de alteração de senha enviada para seu e-mail!')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-slate-500" />
                <span>Alterar Senha</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => showToast('Todas as outras sessões ativas foram encerradas com sucesso!')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Encerrar Sessões Ativas</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                if (confirm('Tem certeza de que deseja solicitar a exclusão da sua conta no Grana+?')) {
                  showToast('Solicitação de exclusão recebida com sucesso.');
                }
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Excluir Conta</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* 6. DADOS */}
        <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
              <Download className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Gestão de Dados</h3>
              <p className="text-xs text-slate-400">Exporte ou restaure suas informações financeiras</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#1E6B4B]" />
                <div className="text-left">
                  <span className="block">Exportar Dados</span>
                  <span className="text-[10px] text-slate-400 font-normal">Baixar backup completo em JSON</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleImportData}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-[#1E6B4B]" />
                <div className="text-left">
                  <span className="block">Importar Dados</span>
                  <span className="text-[10px] text-slate-400 font-normal">Restaurar registros anteriores</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

      {/* 7. PLANO DE ASSINATURA */}
      <div className="bg-gradient-to-r from-[#165037] via-[#1E6B4B] to-[#23825C] rounded-[28px] p-6 lg:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Crown className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Assinatura Grana+</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Plano Atual: Free</h2>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
              Ativo
            </span>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg">
            Aproveite todos os recursos essenciais para organização financeira. Faça o upgrade para o Pro para relatórios ilimitados e sincronização avançada.
          </p>
        </div>

        <button
          onClick={() => showToast('O Grana+ Pro estará disponível em breve com novidades exclusivas!')}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-amber-900/20 shrink-0 uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-slate-900 fill-slate-900" />
          <span>Conhecer Grana+ Pro</span>
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-[28px] p-6 lg:p-7 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100 shrink-0">
                  <User className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Editar Perfil</h3>
                  <p className="text-xs text-slate-400">Atualize seus dados pessoais de exibição</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/10"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
