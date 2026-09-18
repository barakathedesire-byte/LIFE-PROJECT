import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleClearAndReload = () => {
    try {
      localStorage.removeItem('lumo_token');
      localStorage.removeItem('lumo_auth_user');
      localStorage.removeItem('lumo_user');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-800 rounded-3xl p-8 border border-neutral-700/80 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <ShieldAlert size={36} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Application Recovered
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                An unexpected component rendering error occurred. LUMO Safety Guard prevented a complete system crash.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-neutral-900/90 rounded-2xl p-4 text-left border border-neutral-700/60 overflow-hidden">
                <p className="text-xs font-mono text-red-400 font-semibold truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#e55e00] text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={16} />
                <span>Return to Storefront Home</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reset Cache & Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
