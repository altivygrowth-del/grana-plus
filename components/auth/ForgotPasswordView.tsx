import React, { useState } from 'react';
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { resetPasswordForEmail } from '../../services/auth/auth.service';

interface ForgotPasswordViewProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordForEmail({ email });

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        setSuccessMsg(
          `Enviamos as instruções de redefinição de senha para o e-mail ${email}. Verifique sua caixa de entrada e spam.`
        );
      }
    } catch {
      setErrorMsg('Erro de conexão ao solicitar a recuperação. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#4CAF6A] mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Recuperar Senha
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
          Digite seu e-mail cadastrado e enviaremos um link de acesso seguro para você redefinir sua senha
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
            <div className="mt-4">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {!successMsg && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              E-mail cadastrado
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/20 focus:border-[#1E6B4B] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Enviar instruções de recuperação</span>
            )}
          </button>
        </form>
      )}

      {/* Return link */}
      <div className="mt-8 text-center pt-6 border-t border-slate-200/80">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 font-bold text-[#1E6B4B] hover:text-[#165037] text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página de Login</span>
        </button>
      </div>
    </div>
  );
};
