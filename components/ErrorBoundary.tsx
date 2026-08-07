import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
      console.error('Uncaught Error in ErrorBoundary:', error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#07130E] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#0B251B] rounded-3xl p-8 shadow-xl border border-slate-200/80 dark:border-emerald-800/40 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Algo não saiu como esperado
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Ocorreu um erro inesperado ao carregar esta parte da aplicação. Tente recarregar a página para continuar.
            </p>

            {this.state.error && (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV && (
              <div className="bg-slate-100 dark:bg-[#071912] p-3 rounded-xl text-left mb-6 font-mono text-[10px] text-rose-600 dark:text-rose-300 overflow-x-auto max-h-32 border border-slate-200 dark:border-emerald-900/40">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-emerald-950/60 hover:bg-slate-200 text-slate-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-emerald-800/40"
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
