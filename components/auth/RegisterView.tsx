import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { signUp } from '../../services/auth/auth.service';
import { UserProfileData } from '../../services/auth/auth.types';

interface RegisterViewProps {
  onSuccess: (user: any, profile: UserProfileData | null) => void;
  onNavigateLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccess,
  onNavigateLogin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUp({ name, email, password, confirmPassword });

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else if (res.needsConfirmation) {
        setLoading(false);
        setSuccessMsg('Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para sua caixa de entrada.');
      } else if (res.user) {
        onSuccess(res.user, res.profile || null);
      }
    } catch {
      setErrorMsg('Erro de conexão ao realizar o cadastro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#1E6B4B] text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
          <span>Crie sua conta no Grana+</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Comece grátis agora
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
          Organize seu orçamento, acompanhe metas e tenha controle financeiro total
        </p>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">
            {successMsg}
            <div className="mt-3">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Ir para o Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {!successMsg && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome Completo
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1E6B4B] transition-colors duration-200" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E6B4B]/10 focus:border-[#1E6B4B] transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1E6B4B] transition-colors duration-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E6B4B]/10 focus:border-[#1E6B4B] transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha (mínimo 6 caracteres)
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1E6B4B] transition-colors duration-200" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E6B4B]/10 focus:border-[#1E6B4B] transition-all duration-200 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmar Senha
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1E6B4B] transition-colors duration-200" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1E6B4B]/10 focus:border-[#1E6B4B] transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-[#1E6B4B]/20 hover:shadow-xl hover:shadow-[#1E6B4B]/35 hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Criar minha conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* MICROCOPY */}
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF6A]" /> Plano Gratuito
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF6A]" /> Sem cartão de crédito
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF6A]" /> Seus dados protegidos
            </span>
          </div>
        </form>
      )}

      {/* Switch to Login */}
      <div className="mt-6 text-center pt-5 border-t border-slate-200/80">
        <p className="text-xs sm:text-sm text-slate-600">
          Já tem uma conta no Grana+?{' '}
          <button
            onClick={onNavigateLogin}
            className="font-bold text-[#1E6B4B] hover:text-[#165037] underline underline-offset-4 transition-colors duration-200 cursor-pointer"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};
