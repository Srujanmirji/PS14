import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log locally only per privacy rules
    console.error("Local ErrorBoundary caught:", error, errorInfo);
  }

  handleRestart = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#070B1A] text-slate-100">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6">
              An unexpected error occurred. You can reload the app safely.
            </p>
            <button
              type="button"
              onClick={this.handleRestart}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Restart Saathi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
